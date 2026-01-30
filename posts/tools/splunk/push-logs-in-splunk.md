# Push Logs In Splunk

![Splunk Logo](https://miro.medium.com/v2/resize:fit:900/format:webp/1*XiBLnt5FSg4SpAwcvkwo7w.jpeg)

Learn how to push local log files to Splunk using Java and the Splunk REST API. This guide covers installation, configuration, and implementation.

---

## Install Splunk with Podman

First, install and run Splunk using Podman (or Docker):

```bash
podman run -d \
  --name splunk \
  --platform linux/amd64 \ #If Using Macos
  -p 8000:8000 \
  -p 8089:8089 \
  -e SPLUNK_GENERAL_TERMS="--accept-sgt-current-at-splunk-com" \
  -e SPLUNK_START_ARGS="--accept-license" \
  -e SPLUNK_PASSWORD="Admin@123" \
  -v splunk-data:/opt/splunk/var \
  docker.io/splunk/splunk:latest
```

### Port Mapping
- **8000**: Splunk Web UI
- **8089**: Splunk Management Port (REST API)

### Access Splunk
- **Web UI**: http://localhost:8000
- **Username**: admin
- **Password**: Admin@123

---

## Dependencies

This implementation uses **Java 11+** built-in features:
- `java.net.http.HttpClient` - HTTP client for REST API calls
- `javax.net.ssl` - SSL/TLS configuration
- `java.nio.file` - File operations
- `java.util.Base64` - Basic authentication encoding

**No external dependencies required!**

---

## Implementation

### 1. SplunkClient.java

```java
package com.example.splunk;

import javax.net.ssl.SSLContext;
import javax.net.ssl.SSLParameters;
import javax.net.ssl.TrustManager;
import javax.net.ssl.X509TrustManager;
import java.io.File;
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.security.SecureRandom;
import java.security.cert.X509Certificate;
import java.util.Base64;
import java.util.Objects;

/**
 * Splunk Client for pushing local logs to Splunk via REST API
 * VM Argument: -Djdk.internal.httpclient.disableHostnameVerification=true
 */
public class SplunkClient {
    
    private static final HttpClient client = createInsecureClient();
    private static final String baseUrl = "https://127.0.0.1:8089";
    private static final String auth = Base64.getEncoder()
            .encodeToString(("admin" + ":" + "Admin@123").getBytes());
    
    /**
     * Create an insecure HTTP client that trusts all certificates
     * Useful for local development with self-signed certificates
     */
    private static HttpClient createInsecureClient() {
        try {
            TrustManager[] trustAll = new TrustManager[]{
                new X509TrustManager() {
                    public void checkClientTrusted(X509Certificate[] chain, String authType) {}
                    public void checkServerTrusted(X509Certificate[] chain, String authType) {}
                    public X509Certificate[] getAcceptedIssuers() {
                        return new X509Certificate[0];
                    }
                }
            };

            SSLContext sslContext = SSLContext.getInstance("TLS");
            sslContext.init(null, trustAll, new SecureRandom());
            
            return HttpClient.newBuilder()
                    .sslContext(sslContext)
                    .sslParameters(disableHostnameVerification())
                    .build();

        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    /**
     * Disable hostname verification to fix "No subject alternative names present" error
     */
    private static SSLParameters disableHostnameVerification() {
        SSLParameters params = new SSLParameters();
        params.setEndpointIdentificationAlgorithm(null);
        return params;
    }

    /**
     * Create a new index in Splunk
     * @param indexName Name of the index to create
     * @return true if index created or already exists
     */
    public static boolean createIndex(String indexName) 
            throws IOException, InterruptedException {
        var uri = URI.create(baseUrl + "/servicesNS/admin/search/data/indexes");
        var body = "name=" + indexName;
        
        var request = HttpRequest.newBuilder()
                .uri(uri)
                .header("Authorization", "Basic " + auth)
                .header("Content-Type", "application/x-www-form-urlencoded")
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .build();
        
        var response = client.send(request, HttpResponse.BodyHandlers.ofString());
        return response.statusCode() == 201 || response.statusCode() == 409;
    }
    
    /**
     * Push a single log file to Splunk
     * @param indexName Target Splunk index
     * @param filePath Path to the log file
     * @return true if successfully pushed
     */
    public static boolean pushLogFile(String indexName, String filePath) 
            throws IOException, InterruptedException {
        var file = new File(filePath);
        if (!file.exists()) {
            System.err.println("File not found: " + filePath);
            return false;
        }
        
        var uri = URI.create(baseUrl + "/services/receivers/simple?index=" + indexName);
        var content = Files.readString(Paths.get(filePath));
        
        var request = HttpRequest.newBuilder()
                .uri(uri)
                .header("Authorization", "Basic " + auth)
                .header("Content-Type", "text/plain")
                .POST(HttpRequest.BodyPublishers.ofString(content))
                .build();
        
        var response = client.send(request, HttpResponse.BodyHandlers.ofString());
        return response.statusCode() == 200;
    }

    /**
     * Push all log files from a directory to Splunk
     * @param indexName Target Splunk index
     * @param logDir Directory containing log files
     */
    public static void pushLogsFromDirectory(String indexName, String logDir) 
            throws IOException, InterruptedException {
        var dir = new File(logDir);
        if (!dir.exists() || !dir.isDirectory() || dir.listFiles() == null) {
            System.out.println("Directory " + logDir + " not found");
            return;
        }

        int successCount = 0;
        int failCount = 0;
        
        for (var file : Objects.requireNonNull(dir.listFiles())) {
            if (file.isFile() && file.getName().toLowerCase().contains("log")) {
                System.out.println("Pushing " + file.getName() + "...");
                boolean success = pushLogFile(indexName, file.getAbsolutePath());
                if (success) {
                    successCount++;
                    System.out.println("✓ Successfully pushed: " + file.getName());
                } else {
                    failCount++;
                    System.err.println("✗ Failed to push: " + file.getName());
                }
            }
        }
        
        System.out.println("\n=== Summary ===");
        System.out.println("Success: " + successCount);
        System.out.println("Failed: " + failCount);
    }
}
```

### 2. Example.java

```java
package com.example.splunk;

import java.io.IOException;

/**
 * Example: Push Local Logs to Splunk
 */
public class Example {

    private static final String INDEX_NAME = "v4";
    private static final String LOG_PATH = "/Users/apatel2/Downloads/sli-764-testing/logs/v4";
    
    public static void main(String[] args) throws IOException, InterruptedException {
        System.out.println("=== Splunk Log Pusher ===\n");
        
        // Step 1: Create index
        System.out.println("Creating index: " + INDEX_NAME);
        boolean indexCreated = SplunkClient.createIndex(INDEX_NAME);
        if (indexCreated) {
            System.out.println("✓ Index created or already exists\n");
        } else {
            System.err.println("✗ Failed to create index");
            return;
        }
        
        // Step 2: Push logs from directory
        System.out.println("Pushing logs from: " + LOG_PATH);
        SplunkClient.pushLogsFromDirectory(INDEX_NAME, LOG_PATH);
        
        System.out.println("\n✓ Done! Check Splunk Web UI at http://localhost:8000");
    }
}
```

---

## Usage

### 1. Run with VM Arguments

**Important**: Add this VM argument to disable hostname verification for self-signed certificates:

```
-Djdk.internal.httpclient.disableHostnameVerification=true
```