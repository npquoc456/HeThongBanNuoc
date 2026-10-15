package com.example.demo.controller;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.qrcode.QRCodeWriter;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.Map;

@RestController
@RequestMapping("/api/demo-payment")
@CrossOrigin("*")
public class DemoPaymentController {

    @GetMapping(value = "/qr", produces = MediaType.IMAGE_PNG_VALUE)
    public ResponseEntity<byte[]> createDemoQr(
            @RequestParam("amount") BigDecimal amount,
            @RequestParam(name = "invoiceId", defaultValue = "new") String invoiceId) {
        if (amount.signum() <= 0 || amount.scale() > 2) {
            return ResponseEntity.badRequest().build();
        }
        String payload = "CAFE-HELLO-DEMO|INVOICE=" + invoiceId + "|AMOUNT="
                + amount.stripTrailingZeros().toPlainString();
        try {
            var hints = Map.of(EncodeHintType.CHARACTER_SET, StandardCharsets.UTF_8.name());
            var matrix = new QRCodeWriter().encode(payload, BarcodeFormat.QR_CODE, 280, 280, hints);
            ByteArrayOutputStream output = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(matrix, "PNG", output);
            return ResponseEntity.ok()
                    .cacheControl(CacheControl.noStore())
                    .contentType(MediaType.IMAGE_PNG)
                    .body(output.toByteArray());
        } catch (Exception ex) {
            throw new IllegalStateException("Không thể tạo mã QR thanh toán demo.", ex);
        }
    }
}
