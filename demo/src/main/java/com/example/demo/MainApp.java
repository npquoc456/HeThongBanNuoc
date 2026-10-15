package com.example.demo;

import java.net.ServerSocket;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.util.ArrayList;
import java.util.List;

import org.springframework.boot.SpringApplication;
import org.springframework.context.ConfigurableApplicationContext;

import com.example.demo.service.NhanVienService;

import javafx.application.Application;
import javafx.application.Platform;
import javafx.concurrent.Worker;
import javafx.scene.Scene;
import javafx.scene.control.Alert;
import javafx.scene.web.WebEngine;
import javafx.scene.web.WebView;
import javafx.stage.Stage;
import netscape.javascript.JSObject;

public class MainApp extends Application {

    private final String baseUrl =getClass().getResource("/Frontend-design/").toExternalForm();
    private ConfigurableApplicationContext springContext;
    private NhanVienService nhanVienService;

    private WebEngine webEngine;
    private JavaBridge javaBridge;

    private static final String DEFAULT_PORT = "8080";
    private static final String BACKUP_PORT = "8082";

    private static String selectedPort = DEFAULT_PORT;

    @Override
    public void init() {
        if (isPortAvailable(Integer.parseInt(DEFAULT_PORT))) {
            selectedPort = DEFAULT_PORT;
            System.out.println("Spring Boot chạy trên cổng 8080");

        } else {
            selectedPort = BACKUP_PORT;
            System.out.println("8080 đã được sử dụng -> chuyển sang 8082");
        }
    }

    private String frontendUrl(String page) {
        return baseUrl + page + "?apiPort=" + selectedPort;
    }

    private boolean isPortAvailable(int port) {
        try (ServerSocket socket = new ServerSocket(port)) {
            socket.setReuseAddress(true);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    @Override
    public void start(Stage primaryStage) {
        javaBridge = new JavaBridge();
        openNewWindow(primaryStage, "Hệ Thống Bán Hàng", true);
        Thread springThread = new Thread(() -> {
            try {
                List<String> argsList = new ArrayList<>(getParameters().getRaw());
                argsList.add("--server.port=" + selectedPort);

                springContext = SpringApplication.run(
                        DemoApplication.class,
                        argsList.toArray(new String[0])
                );
                nhanVienService = springContext.getBean(NhanVienService.class);
                System.out.println("Spring Boot khởi động thành công.");
            } catch (Exception e) {
                e.printStackTrace();
                Platform.runLater(() -> showError(
                        "Lỗi",
                        "Không thể khởi động Spring Boot hoặc MySQL."
                ));

            }
        });
        springThread.setDaemon(true);
        springThread.start();
    }

    public void openNewWindow(Stage stage, String title, boolean isMainWindow) {
        WebView webView = new WebView();
        webEngine = webView.getEngine();
        webEngine.setOnAlert(event -> {
            Alert alert = new Alert(Alert.AlertType.INFORMATION);
            alert.setHeaderText(null);
            alert.setTitle("Thông báo");
            alert.setContentText(event.getData());
            alert.showAndWait();

        });
        webEngine.getLoadWorker().stateProperty().addListener((obs, oldState, newState) -> {
            if (newState == Worker.State.SUCCEEDED) {
                JSObject window = (JSObject) webEngine.executeScript("window");
                window.setMember("javaBackend", javaBridge);

            }
        });
        if (isMainWindow) {
            showLoading();
            new Thread(() -> {
                while (springContext == null|| !springContext.isRunning()|| nhanVienService == null) {
                    try {

                        Thread.sleep(300);

                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                    }
                }
                Platform.runLater(() -> webEngine.load(frontendUrl("Login.html")));
            }).start();
        } else {
            webEngine.load(frontendUrl("Login.html"));
        }

        Scene scene = new Scene(webView, 1440, 1024);
        stage.setScene(scene);
        stage.setTitle(title);
        stage.centerOnScreen();
        stage.show();

    }

    private void showLoading() {
        webEngine.loadContent(
            "<html><body style='background:#ffffff; color:#000; font-family:Arial; text-align:center; padding-top:200px;'>" +
                "<h2> XIN CHÀO! HỆ THỐNG MÁY CHỦ ĐANG KHỞI ĐỘNG...</h2>" +
             "<p style='color:#000;'>Đang thiết lập hệ thống</p>" +
             "<div style='margin:20px auto; width:50px; height:50px; border:5px solid #ddd; border-top:5px solid #000; border-radius:50%; animation:spin 1s linear infinite;'></div>" +
            "<style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>" +
            "</body></html>"
        );
    }

    private void showError(String title, String message) {

        Alert alert = new Alert(Alert.AlertType.ERROR);
        alert.setHeaderText(null);
        alert.setTitle(title);
        alert.setContentText(message);
        alert.showAndWait();

    }

    @Override
    public void stop() {
        if (springContext != null) {
            springContext.close();
        }
        Platform.exit();
        System.exit(0);
    }
    
    public class JavaBridge {
        public boolean xuLyDangNhap(String id, String password) {
            if (nhanVienService == null) {
                Platform.runLater(() ->
                        showError("Thông báo","Hệ thống vẫn đang khởi động.")
                );
                return false;
            }
            try {
                int employeeId = Integer.parseInt(id);

                nhanVienService.DangNhap(employeeId, password);

                return true;

            } catch (NumberFormatException e) {
                Platform.runLater(() -> showError("Lỗi","ID phải là số.")
                );
                return false;
            } catch (Exception e) {
                Platform.runLater(() -> showError( "Đăng nhập thất bại", e.getMessage())
                );
                return false;
            }
        }

        public void loadTrang(String trang) {
            Platform.runLater(() -> webEngine.load(frontendUrl(trang)));
        }

        public String saveInvoiceTxt(String invoiceId, String content) {
            if (content == null || content.isBlank()) {
                throw new IllegalArgumentException("Nội dung hóa đơn không được để trống.");
            }
            String safeInvoiceId = invoiceId == null
                    ? ""
                    : invoiceId.replaceAll("[^A-Za-z0-9_-]", "_");
            if (safeInvoiceId.isBlank()) {
                safeInvoiceId = String.valueOf(System.currentTimeMillis());
            }

            Path workingDirectory = Path.of(System.getProperty("user.dir")).toAbsolutePath();
            Path iconsDirectory = workingDirectory.resolve("ICONS");
            Path invoiceFile = iconsDirectory.resolve("HoaDon_" + safeInvoiceId + ".txt");
            try {
                Files.createDirectories(iconsDirectory);
                Files.writeString(
                        invoiceFile,
                        content,
                        StandardCharsets.UTF_8,
                        StandardOpenOption.CREATE,
                        StandardOpenOption.TRUNCATE_EXISTING);
                return invoiceFile.toString();
            } catch (IOException ex) {
                throw new IllegalStateException("Không thể lưu hóa đơn vào thư mục ICONS.", ex);
            }
        }
    }
}