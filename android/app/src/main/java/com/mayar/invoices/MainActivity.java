package com.mayar.invoices;

import android.content.ContentValues;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.print.PrintAttributes;
import android.print.PrintDocumentAdapter;
import android.print.PrintManager;
import android.provider.MediaStore;
import android.util.Base64;
import android.webkit.JavascriptInterface;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.widget.Toast;
import androidx.core.content.FileProvider;
import com.getcapacitor.BridgeActivity;

import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setupBridge();
    }

    @Override
    public void onStart() {
        super.onStart();
        setupBridge();
    }

    @Override
    public void onResume() {
        super.onResume();
        setupBridge();
    }

    private void setupBridge() {
        try {
            if (getBridge() != null && getBridge().getWebView() != null) {
                WebView webView = getBridge().getWebView();
                WebSettings settings = webView.getSettings();
                settings.setJavaScriptEnabled(true);
                settings.setDomStorageEnabled(true);
                settings.setAllowFileAccess(true);
                settings.setAllowContentAccess(true);

                webView.addJavascriptInterface(new AndroidBridge(this, webView), "AndroidPrint");
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public static class AndroidBridge {
        private final MainActivity activity;
        private final WebView webView;

        public AndroidBridge(MainActivity activity, WebView webView) {
            this.activity = activity;
            this.webView = webView;
        }

        @JavascriptInterface
        public void printPage() {
            activity.runOnUiThread(() -> {
                try {
                    PrintManager printManager = (PrintManager) activity.getSystemService(Context.PRINT_SERVICE);
                    if (printManager != null) {
                        String jobName = "Invoice_" + System.currentTimeMillis();
                        PrintDocumentAdapter printAdapter = webView.createPrintDocumentAdapter(jobName);
                        printManager.print(jobName, printAdapter, new PrintAttributes.Builder()
                                .setMediaSize(PrintAttributes.MediaSize.ISO_A4)
                                .build());
                    }
                } catch (Exception e) {
                    e.printStackTrace();
                    Toast.makeText(activity, "Print error: " + e.getMessage(), Toast.LENGTH_SHORT).show();
                }
            });
        }

        @JavascriptInterface
        public void savePdf(String base64Data, String filename) {
            activity.runOnUiThread(() -> {
                try {
                    if (base64Data == null || base64Data.isEmpty()) {
                        Toast.makeText(activity, "PDF generation failed", Toast.LENGTH_SHORT).show();
                        return;
                    }

                    // Clean base64 string
                    String cleanBase64 = base64Data;
                    if (cleanBase64.contains(",")) {
                        cleanBase64 = cleanBase64.substring(cleanBase64.indexOf(",") + 1);
                    }
                    byte[] pdfBytes = Base64.decode(cleanBase64, Base64.DEFAULT);

                    String finalFileName = (filename != null && !filename.isEmpty()) ? filename : ("Invoice_" + System.currentTimeMillis() + ".pdf");
                    if (!finalFileName.toLowerCase().endsWith(".pdf")) {
                        finalFileName += ".pdf";
                    }

                    File savedFile = null;

                    // 1. Save to App Cache / Documents for FileProvider Sharing
                    File docDir = new File(activity.getCacheDir(), "documents");
                    if (!docDir.exists()) docDir.mkdirs();
                    File cacheFile = new File(docDir, finalFileName);
                    try (FileOutputStream fos = new FileOutputStream(cacheFile)) {
                        fos.write(pdfBytes);
                        fos.flush();
                    }
                    savedFile = cacheFile;

                    // 2. Also save into device Public Downloads folder so it stays permanently
                    try {
                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                            ContentValues values = new ContentValues();
                            values.put(MediaStore.MediaColumns.DISPLAY_NAME, finalFileName);
                            values.put(MediaStore.MediaColumns.MIME_TYPE, "application/pdf");
                            values.put(MediaStore.MediaColumns.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS + "/Invoices");

                            Uri extUri = activity.getContentResolver().insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, values);
                            if (extUri != null) {
                                try (OutputStream os = activity.getContentResolver().openOutputStream(extUri)) {
                                    if (os != null) {
                                        os.write(pdfBytes);
                                        os.flush();
                                    }
                                }
                            }
                        } else {
                            File downloadsDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS);
                            if (downloadsDir != null) {
                                if (!downloadsDir.exists()) downloadsDir.mkdirs();
                                File pubFile = new File(downloadsDir, finalFileName);
                                try (FileOutputStream fos = new FileOutputStream(pubFile)) {
                                    fos.write(pdfBytes);
                                    fos.flush();
                                }
                            }
                        }
                    } catch (Exception e) {
                        e.printStackTrace();
                    }

                    // 3. Get FileProvider Uri
                    String authority = activity.getPackageName() + ".fileprovider";
                    Uri fileUri = FileProvider.getUriForFile(activity, authority, savedFile);

                    Toast.makeText(activity, "✅ PDF Saved to Downloads: " + finalFileName, Toast.LENGTH_LONG).show();

                    // 4. Open / Share PDF intent directly
                    try {
                        Intent intent = new Intent(Intent.ACTION_VIEW);
                        intent.setDataAndType(fileUri, "application/pdf");
                        intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_GRANT_WRITE_URI_PERMISSION);
                        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);

                        Intent chooser = Intent.createChooser(intent, "Open / Share Invoice PDF (" + finalFileName + ")");
                        chooser.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                        chooser.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                        activity.startActivity(chooser);
                    } catch (Exception eView) {
                        try {
                            Intent shareIntent = new Intent(Intent.ACTION_SEND);
                            shareIntent.setType("application/pdf");
                            shareIntent.putExtra(Intent.EXTRA_STREAM, fileUri);
                            shareIntent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                            shareIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);

                            Intent chooser = Intent.createChooser(shareIntent, "Share Invoice PDF (" + finalFileName + ")");
                            chooser.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                            chooser.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                            activity.startActivity(chooser);
                        } catch (Exception eShare) {
                            Toast.makeText(activity, "Saved in Downloads/Invoices folder", Toast.LENGTH_LONG).show();
                        }
                    }
                } catch (Exception e) {
                    e.printStackTrace();
                    Toast.makeText(activity, "Error saving PDF: " + e.getMessage(), Toast.LENGTH_LONG).show();
                }
            });
        }
    }
}
