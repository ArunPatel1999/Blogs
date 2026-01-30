# Read Splunk Data Using Query

![Splunk Logo](https://miro.medium.com/v2/resize:fit:900/format:webp/1*XiBLnt5FSg4SpAwcvkwo7w.jpeg)

Learn how to query and read data from Splunk using the Splunk Java SDK with Spring Boot.

---

## Dependencies

Add the Splunk SDK to your `pom.xml`:

```xml
<dependency>
    <groupId>com.splunk</groupId>
    <artifactId>splunk</artifactId>
    <version>1.9.5</version>
</dependency>
```

---

## Configuration

### application.yml

```yaml
splunk:
  host: your-splunk-instance.com
  port: 8089
  scheme: https
  username: your-username
  password: your-password
```

### SplunkConfig.java

```java
@Configuration
public class SplunkConfig {

    @Value("${splunk.host}")
    private String host;

    @Value("${splunk.port}")
    private int port;

    @Value("${splunk.scheme}")
    private String scheme;

    @Value("${splunk.username}")
    private String username;

    @Value("${splunk.password}")
    private String password;

    @Bean
    public Service splunkService() {
        HttpService.setSslSecurityProtocol(SSLSecurityProtocol.TLSv1_2);
        
        ServiceArgs args = new ServiceArgs();
        args.setHost(host);
        args.setPort(port);
        args.setScheme(scheme);
        args.setUsername(username);
        args.setPassword(password);

        return Service.connect(args);
    }
}
```

---

## Search Service

### SplunkSearchService.java

```java
@Service
public class SplunkSearchService {

    private final Service splunkService;

    public SplunkSearchService(Service splunkService) {
        this.splunkService = splunkService;
    }

    public <R> R executeQuery(
            Instant startTime, 
            Instant endTime, 
            String splQuery, 
            Function<ResultsReaderXml, R> function) throws Exception {
        
        // Set time range
        JobArgs jobArgs = new JobArgs();
        jobArgs.setEarliestTime(startTime.getEpochSecond() + "");
        jobArgs.setLatestTime(endTime.getEpochSecond() + "");
        jobArgs.setExecutionMode(JobArgs.ExecutionMode.BLOCKING);
        
        // Create and execute job
        Job job = splunkService.getJobs().create(splQuery, jobArgs);
        
        // Wait for completion
        while (!job.isDone()) {
            Thread.sleep(500);
            job.refresh();
        }

        // Read results
        InputStream resultsStream = job.getResults(new JobResultsArgs());
        ResultsReaderXml reader = new ResultsReaderXml(resultsStream);
        
        var result = function.apply(reader);
        reader.close();
        
        return result;
    }
}
```

---

## Usage Example

```java
@RestController
public class SplunkController {

    @Autowired
    private SplunkSearchService searchService;

    @GetMapping("/search")
    public List<Map<String, String>> searchLogs() throws Exception {
        
        Instant startTime = Instant.now().minus(1, ChronoUnit.HOURS);
        Instant endTime = Instant.now();
        
        String query = "search index=main error | head 100";
        
        return searchService.executeQuery(startTime, endTime, query, reader -> {
            List<Map<String, String>> results = new ArrayList<>();
            
            for (Event event : reader) {
                Map<String, String> eventData = new HashMap<>();
                for (String key : event.keySet()) {
                    eventData.put(key, event.get(key).toString());
                }
                results.add(eventData);
            }
            
            return results;
        });
    }
}
```