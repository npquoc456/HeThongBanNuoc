package com.example.demo.controller;

import org.junit.jupiter.api.Test;

import com.google.zxing.BinaryBitmap;
import com.google.zxing.MultiFormatReader;
import com.google.zxing.client.j2se.BufferedImageLuminanceSource;
import com.google.zxing.common.HybridBinarizer;
import javax.imageio.ImageIO;
import java.io.ByteArrayInputStream;
import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

class DemoPaymentControllerTest {

    @Test
    void createsScannablePngQrForDemoPayment() {
        var response = new DemoPaymentController().createDemoQr(new BigDecimal("25000"), "new");

        assertEquals(200, response.getStatusCode().value());
        assertNotNull(response.getBody());
        assertEquals((byte) 0x89, response.getBody()[0]);
        assertEquals((byte) 0x50, response.getBody()[1]);
        try {
            var image = ImageIO.read(new ByteArrayInputStream(response.getBody()));
            var bitmap = new BinaryBitmap(new HybridBinarizer(new BufferedImageLuminanceSource(image)));
            assertEquals("CAFE-HELLO-DEMO|INVOICE=new|AMOUNT=25000",
                    new MultiFormatReader().decode(bitmap).getText());
        } catch (Exception ex) {
            throw new AssertionError("Demo QR code should decode to its payment details.", ex);
        }
    }

    @Test
    void rejectsZeroPaymentAmount() {
        var response = new DemoPaymentController().createDemoQr(BigDecimal.ZERO, "new");

        assertEquals(400, response.getStatusCode().value());
    }
}
