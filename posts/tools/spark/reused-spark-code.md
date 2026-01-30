# Apache Spark: Building a Reusable Spark Engine

![Apache Spark](https://spark.apache.org/images/spark-logo-trademark.png)

A practical guide to creating a reusable Spark engine for distributed processing in Java. Learn how to build a generic, configurable Spark wrapper that can process any type of data with automatic memory management and parallelization.

## Project Setup

### Maven Dependencies
```xml
<dependencies>
    <dependency>
        <groupId>org.apache.spark</groupId>
        <artifactId>spark-core_2.12</artifactId>
        <version>3.5.0</version>
        <scope>provided</scope>
    </dependency>
</dependencies>
```

### VM Arguments
Add these VM arguments to your run configuration:
```bash
-Xmx12g -Dspark.master="local[*]"
```

## The Reusable Spark Engine Code

```java
import org.apache.spark.SparkConf;
import org.apache.spark.api.java.JavaRDD;
import org.apache.spark.api.java.JavaSparkContext;

import java.io.Serializable;
import java.util.List;
import java.util.function.Consumer;

/**
 * --------------------------------------------------------------------
 * lazy val sparkVersion = "3.5.0"
 * "org.apache.spark" %% "spark-core" % sparkVersion % "provided" exclude ("org.slf4j", "slf4j-log4j12") exclude ("log4j", "log4j"),
 * --------------------------------------------------------------------
 * implements Serializable
 * rddConsumerMethod is static or (Serializable & java.util.function.Consumer<T>) in passing class
 * -----------------------------
 * Add VM => -Xmx12g -Dspark.master="local[*]"
 *
 */

public class SparkEngine implements Serializable {

    private static final boolean IS_SPARK_UI_ENABLED = true;
    private static final boolean IS_CONSOLE_LOG_ENABLED = false;

    /**
     * Execute processing with advanced memory control and optimization
     */
    public static <T> void executeWithMemoryControl(List<T> items, Consumer<T> processor) throws Exception {
        System.out.println("Initializing Optimized Spark Engine...");
        
        // Calculate optimal Spark configuration based on system resources
        SparkConfiguration config = calculateOptimalSparkConfig();
        
        System.out.println("Spark Configuration:");
        System.out.println("  Driver Memory: " + config.driverMemory);
        System.out.println("  Executor Memory: " + config.executorMemory);
        System.out.println("  Parallelism: " + config.parallelism);
        System.out.println("  Max Result Size: " + config.maxResultSize);
        
        JavaSparkContext sparkContext = null;
        try {
            sparkContext = initializeOptimizedSparkContext(config);
            processWithOptimizedDistribution(sparkContext, items, processor);
        } finally {
            if (sparkContext != null) {
                sparkContext.close();
                System.out.println("Spark context closed successfully");
            }
        }
    }

    /**
     * Calculate optimal Spark configuration based on available system resources
     */
    private static SparkConfiguration calculateOptimalSparkConfig() {
        Runtime runtime = Runtime.getRuntime();
        long maxMemory = runtime.maxMemory();
        int availableCores = runtime.availableProcessors();
        
        // Allocate memory conservatively to prevent OOM
        long driverMemoryMB = Math.min(4096, maxMemory / (1024 * 1024) / 3); // 1/3 of available memory, max 4GB
        long executorMemoryMB = Math.min(8192, maxMemory / (1024 * 1024) / 2); // 1/2 of available memory, max 8GB
        long maxResultSizeMB = Math.min(2048, driverMemoryMB / 2); // Half of driver memory, max 2GB
        
        return new SparkConfiguration(
            driverMemoryMB + "m",
            executorMemoryMB + "m", 
            availableCores,
            maxResultSizeMB + "m"
        );
    }

    /**
     * Initialize Spark context with optimized configuration for large dataset processing
     */
    private static JavaSparkContext initializeOptimizedSparkContext(SparkConfiguration config) {
        SparkConf conf = new SparkConf()
                .setAppName("OptimizedRSLProcessor")
                .setMaster("local[" + config.parallelism + "]")
                
                // Memory configuration
                .set("spark.driver.memory", config.driverMemory)
                .set("spark.executor.memory", config.executorMemory)
                .set("spark.driver.maxResultSize", config.maxResultSize)
                
                // Serialization optimization
                .set("spark.serializer", "org.apache.spark.serializer.KryoSerializer")
                .set("spark.kryo.registrationRequired", "false")
                .set("spark.kryo.unsafe", "true")
                
                // Execution optimization
                .set("spark.executor.instances", "1")
                .set("spark.executor.cores", String.valueOf(config.parallelism))
                .set("spark.default.parallelism", String.valueOf(config.parallelism))
                .set("spark.task.maxFailures", "3") // Allow retries for fault tolerance
                .set("spark.task.cpus", "1")
                
                // Memory management optimization
                .set("spark.executor.memory.fraction", "0.8") // 80% for execution, 20% for storage
                .set("spark.executor.memory.storageFraction", "0.3") // 30% of execution memory for caching
                .set("spark.executor.heartbeatInterval", "20s")
                .set("spark.network.timeout", "300s") // Longer timeout for large data
                
                // Garbage collection optimization
                .set("spark.executor.extraJavaOptions", 
                     "-XX:+UseG1GC " +
                     "-XX:+UnlockExperimentalVMOptions " +
                     "-XX:+UseStringDeduplication " +
                     "-XX:MaxGCPauseMillis=200 " +
                     "-XX:G1HeapRegionSize=16m")
                
                // Compression and I/O optimization
                .set("spark.rdd.compress", "true")
                .set("spark.shuffle.compress", "true")
                .set("spark.shuffle.spill.compress", "true")
                .set("spark.broadcast.compress", "true")
                .set("spark.io.compression.codec", "snappy") // Fast compression
                
                // Scheduler optimization
                .set("spark.scheduler.mode", "FAIR")
                .set("spark.scheduler.pool", "production")
                .set("spark.locality.wait", "3s") // Wait for data locality
                
                // Adaptive query execution (if using Spark SQL)
                .set("spark.sql.adaptive.enabled", "true")
                .set("spark.sql.adaptive.coalescePartitions.enabled", "true")
                .set("spark.sql.adaptive.advisoryPartitionSizeInBytes", "128MB")
                
                // UI and logging configuration
                .set("spark.ui.enabled", String.valueOf(IS_SPARK_UI_ENABLED))
                .set("spark.eventLog.enabled", "false") // Disable to save disk space
                .set("spark.executor.processTreeMetrics.enabled", "false");

        // Configure logging
        if (!IS_CONSOLE_LOG_ENABLED) {
            suppressSparkLogging();
        }

        // Configure UI if enabled
        if (IS_SPARK_UI_ENABLED) {
            System.out.println("Spark UI will be available at: http://localhost:4040");
            conf.set("spark.ui.retainedJobs", "20")
                .set("spark.ui.retainedStages", "20")
                .set("spark.ui.retainedTasks", "200")
                .set("spark.ui.timeline.enabled", "true");
        }

        return new JavaSparkContext(conf);
    }

    /**
     * Process items with optimized distribution and load balancing
     */
    private static <T> void processWithOptimizedDistribution(JavaSparkContext sparkContext, List<T> items, Consumer<T> processor) {
        System.out.println("Starting optimized distributed processing...");
        
        // Calculate optimal number of partitions
        int optimalPartitions = Math.min(items.size(), sparkContext.defaultParallelism() * 2);
        
        // Create RDD with optimal partitioning
        JavaRDD<T> itemsRDD = sparkContext.parallelize(items, optimalPartitions);
        
        // Process with enhanced error handling and monitoring
        itemsRDD.foreach(item -> {
            long taskStartTime = System.currentTimeMillis();
            String threadName = Thread.currentThread().getName();
            
            try {
                // Execute the actual processing
                processor.accept(item);
                
                long taskDuration = System.currentTimeMillis() - taskStartTime;
                System.out.println("Task completed: " + item + " in " + taskDuration + "ms on " + threadName);
                
            } catch (Exception e) {
                System.err.println("Task failed: " + item + " on " + threadName + " - " + e.getMessage());
                
                // Log detailed error for debugging
                System.err.println("Error details: " + e.getClass().getSimpleName());
                if (e.getCause() != null) {
                    System.err.println("Root cause: " + e.getCause().getMessage());
                }
                
                // Don't rethrow - let other tasks continue
            }
        });
        
        System.out.println("Distributed processing completed");
    }

    /**
     * Suppress Spark logging for cleaner output
     */
    private static void suppressSparkLogging() {
        System.setProperty("log4j.logger.org.apache.spark", "WARN");
        System.setProperty("log4j.logger.org.eclipse.jetty", "WARN");
        System.setProperty("log4j.logger.org.apache.hadoop", "WARN");
        System.setProperty("log4j.rootLogger", "WARN");
        
        // Suppress Java logging
        java.util.logging.Logger.getLogger("org.apache.spark").setLevel(java.util.logging.Level.WARNING);
        java.util.logging.Logger.getLogger("org.eclipse.jetty").setLevel(java.util.logging.Level.WARNING);
    }
    
    static class SparkConfiguration implements Serializable {
        private final String driverMemory;
        private final String executorMemory;
        private final int parallelism;
        private final String maxResultSize;

        public SparkConfiguration(String driverMemory, String executorMemory, int parallelism, String maxResultSize) {
            this.driverMemory = driverMemory;
            this.executorMemory = executorMemory;
            this.parallelism = parallelism;
            this.maxResultSize = maxResultSize;
        }

    }

}
```

### Step 2: Exampl Code


```java

import com.here.arun.spark.SparkEngine;

import java.io.Serializable;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class SparkRun implements Serializable {


    @Test
    public void test() throws Exception {
        List<Integer> tiles = Stream.of(23611407, 23618402,23608579, 23600780, 23605369, 23608582, 23605342);
        SparkEngine.executeWithMemoryControl(tiles, (Serializable & java.util.function.Consumer<Long>) this::regression_test);
    }

    private void regression_test(Integer tile) {
        long startTime = System.currentTimeMillis();
        System.out.println(" ==============Processing Start with "+tile + " : " + LocalTime.now() +" ============\n");
        try{
            // Write your code   
        } catch (Exception e) {
            System.err.println("Exception to tile Process : "+tile+"\n\t ==> "+e.getLocalizedMessage());
            e.printStackTrace();
        }
        long duration = System.currentTimeMillis() - startTime;
        System.out.println(" ==============Processing complete for tile id "+tile+ " : "+ LocalDate.now() + " :: "+ duration + " ============\n\n\n");
    }
}

```
