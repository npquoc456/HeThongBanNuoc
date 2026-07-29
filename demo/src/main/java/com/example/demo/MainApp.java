package com.example.demo;

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
import org.springframework.boot.SpringApplication;
import org.springframework.context.ConfigurableApplicationContext;

import java.net.ServerSocket;
import java.util.ArrayList;
import java.util.List;

public class MainApp extends Application {
    private final String baseUrl = getClass().getResource("/Frontend-design/").toExternalForm();
    private ConfigurableApplicationContext springContext;
    private NhanVienService nhanVienService;

    // Khai báo 2 cổng dự phòng
    private static final String DEFAULT_PORT = "8080";
    private static final String BACKUP_PORT = "8082";
    private static String selectedPort = DEFAULT_PORT;

    // 1. TỰ ĐỘNG CHECK CỔNG KHI APP VỪA KHỞI CHẠY
    @Override
    public void init() throws Exception {
        if (isPortAvailable(Integer.parseInt(DEFAULT_PORT))) {
            selectedPort = DEFAULT_PORT;
            System.out.println("Cổng 8080 trống! Hệ thống sẽ chạy trên cổng: 8080");
        } else {
            selectedPort = BACKUP_PORT;
            System.out.println("Cổng 8080 đã được sử dụng! Tự động chuyển sang cổng dự phòng: 8082");
        }
    }

    private boolean isPortAvailable(int port) {
        try (ServerSocket serverSocket = new ServerSocket(port)) {
            serverSocket.setReuseAddress(true);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    // 2. KHỞI CHẠY GIAO DIỆN VÀ SPRING BOOT NGẦM
    @Override
    public void start(Stage primaryStage) {
        // Bật ngay cửa sổ Loading giao diện
        openNewWindow(primaryStage, "Hệ Thống Bán Hàng - Đăng Nhập", true);

        // Chạy Spring Boot ở luồng riêng (ngầm) để không làm đơ giao diện
        Thread springThread = new Thread(() -> {
            try {
                List<String> argsList = new ArrayList<>(getParameters().getRaw());
                argsList.add("--server.port=" + selectedPort);
                String[] args = argsList.toArray(new String[0]);

                // Chú ý: Gọi DemoApplication.class để boot toàn bộ cấu hình dự án
                springContext = SpringApplication.run(DemoApplication.class, args);
                
                // Lấy Service để sử dụng đăng nhập
                nhanVienService = springContext.getBean(NhanVienService.class);
            } catch (Exception e) {
                e.printStackTrace();
                Platform.runLater(() -> {
                    Alert alert = new Alert(Alert.AlertType.ERROR);
                    alert.setTitle("Lỗi Khởi Động");
                    alert.setContentText("Không thể khởi chạy Spring Boot kết nối MySQL!");
                    alert.showAndWait();
                });
            }
        });
        springThread.setDaemon(true);
        springThread.start();
    }

    // 3. QUẢN LÝ CỬA SỔ & MÀN HÌNH CHỜ (LOADING)
    public void openNewWindow(Stage stage, String title, boolean isMainWindow) {
        Platform.runLater(() -> {
            WebView webView = new WebView();
            WebEngine webEngine = webView.getEngine();

            // Hiển thị thông báo Alert của JS thành Popup của Windows
            webEngine.setOnAlert(event -> {
                Alert alert = new Alert(Alert.AlertType.INFORMATION);
                alert.setTitle("Thông báo");
                alert.setHeaderText(null);
                alert.setContentText(event.getData());
                alert.showAndWait();
            });

            // Gắn Cầu nối Java <-> JS khi trang web load xong
            webEngine.getLoadWorker().stateProperty().addListener((obs, oldState, newState) -> {
                if (newState == Worker.State.SUCCEEDED) {
                    JSObject window = (JSObject) webEngine.executeScript("window");
                    // Tôi đặt tên là 'javaBackend' để nó khớp với code JS bạn đã viết ở file Login.html
                    window.setMember("javaBackend", new JavaBridge());
                }
            });

            if (isMainWindow && springContext == null) {
                // Hiển thị màn hình Loading trong lúc chờ Spring Boot + MySQL
                webEngine.loadContent(
                    "<html><body style='background:#ffffff; color:#000; font-family:Arial; text-align:center; padding-top:200px;'>" +
                    "<h2> XIN CHÀO! HỆ THỐNG MÁY CHỦ ĐANG KHỞI ĐỘNG...</h2>" +
                    "<p style='color:#000;'>Đang thiết lập hệ thống</p>" +
                    "<div style='margin:20px auto; width:50px; height:50px; border:5px solid #ddd; border-top:5px solid #000; border-radius:50%; animation:spin 1s linear infinite;'></div>" +
                    "<style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>" +
                    "</body></html>"
                );

                // Luồng vòng lặp chờ Spring Boot chạy xong
                new Thread(() -> {
                    while (springContext == null || !springContext.isRunning()) {
                        try { Thread.sleep(400); } catch (InterruptedException e) {}
                    }
                    // Sau khi Boot xong -> Hiển thị file Login.html tuyệt đẹp của bạn
                    Platform.runLater(() -> webEngine.load(baseUrl + "Login.html"));
                }).start();
            } else {
                webEngine.load(baseUrl + "Login.html");
            }

            Scene scene = new Scene(webView, 1440,  1024);
            stage.setTitle(title);
            stage.setScene(scene);
            stage.centerOnScreen();
            stage.show();
        });
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

        // --- 1. HÀM XỬ LÝ ĐĂNG NHẬP (Của dự án bạn) ---
        public void xuLyDangNhap(String id, String password) {
            try {
                // Gọi tới Service kết nối MySQL để kiểm tra
                nhanVienService.DangNhap(Integer.parseInt(id), password);
                
                Platform.runLater(() -> {
                    Alert alert = new Alert(Alert.AlertType.INFORMATION);
                    alert.setTitle("Thành công");
                    alert.setContentText("Đăng nhập thành công! Đang chuyển vào hệ thống...");
                    alert.showAndWait();
                    // Ở đây sau này bạn sẽ gọi lệnh chuyển sang màn hình Bán Hàng
                });
            } catch (Exception e) {
                // Báo lỗi bằng Popup xịn xò của JavaFX
                Platform.runLater(() -> {
                    Alert alert = new Alert(Alert.AlertType.ERROR);
                    alert.setTitle("Đăng nhập thất bại");
                    alert.setContentText(e.getMessage()); // Sẽ in ra chữ "Sai ID hoặc mật khẩu" từ Service
                    alert.showAndWait();
                });
            }
        }

    }
}