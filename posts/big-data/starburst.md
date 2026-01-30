# Starburst

![Starburst Logo](https://docs.starburst.io/assets/img/logo/Starburst_Logo_White+Blue.svg)

A comprehensive guide to commonly used Starburst (Trino/Presto) SQL functions for data manipulation and transformation.

## JSON Functions

### JSON_EXTRACT : Extract values from Strings.

```sql
-- Extract coordinate value from geometry JSON
JSON_EXTRACT(lorr.geometry, '$.coordinates[0][1]')

-- Extract nested object
JSON_EXTRACT(data, '$.user.profile.name')

-- Extract array element
JSON_EXTRACT(data, '$.items[0]')
```

### json_extract_scalar: Extract values from JSON.

```sql
-- Extract value from JSON object
json_extract_scalar(x, '$.value')

-- Extract nested scalar value
json_extract_scalar(data, '$.user.id')

-- Use in array transformation
TRANSFORM(items, x -> json_extract_scalar(x, '$.price'))
```

## Array Functions

### TRANSFORM: Apply a lambda function to each element in an array (similar to map operation).

```sql
-- Extract road segment IDs from array of objects
TRANSFORM(lorr.posted_on_roads, x -> x.roadsegment.segment.id)

-- Transform array of numbers
TRANSFORM(prices, x -> x * 1.1)

-- Extract specific field from array of JSON
TRANSFORM(json_array, x -> json_extract_scalar(x, '$.name'))
```

### ARRAY_AGG: Aggregate values into an array (returns list after GROUP BY).

```sql
-- Collect all values into array
SELECT category, ARRAY_AGG(product_name) as products FROM products GROUP BY category;

-- Aggregate with ordering
SELECT user_id, ARRAY_AGG(order_id ORDER BY order_date DESC)as recent_orders FROM orders GROUP BY user_id;
```

### ARRAY_DISTINCT: Return unique values from an array.

```sql
-- Remove duplicates from array
SELECT ARRAY_DISTINCT(tags) as unique_tags FROM articles;

-- Use with transformed data
SELECT ARRAY_DISTINCT(TRANSFORM(items, x -> x.category)) FROM products;
```

### cardinality
Get the size/length of an array.

```sql
-- Get array size
SELECT cardinality(tags) FROM articles;

-- Filter by array size
SELECT * FROM products WHERE cardinality(categories) > 2;
```

### FILTER
Filter elements in an array based on a condition.

```sql
-- Filter array elements
SELECT FILTER(prices, x -> x > 100) FROM products;

-- Filter with complex condition
SELECT FILTER(
    orders, 
    x -> x.status = 'completed' AND x.amount > 50
) as qualified_orders
FROM customer_orders;

-- Use in WHERE clause
SELECT *
FROM products
WHERE cardinality(FILTER(reviews, x -> x.rating >= 4)) > 10;
```

## Type Casting

### CAST - Basic Types
Convert values between different data types.

```sql
-- Cast to integer
CAST(value AS INTEGER)

-- Cast to decimal with precision
CAST(value AS DECIMAL(10, 2))

-- Cast to JSON array
CAST(over_under_pass_indicator AS ARRAY(JSON))

-- Cast string to array
CAST(json_string AS ARRAY(VARCHAR))

-- Cast to map type
CAST(data AS MAP(VARCHAR, INTEGER))

-- Cast to row type
CAST(data AS ROW(id INTEGER, name VARCHAR))
```

## Examples

### Example 1: Extract and Transform JSON Data
```sql
SELECT 
    id,
    JSON_EXTRACT(geometry, '$.type') as geo_type,
    CAST(JSON_EXTRACT(geometry, '$.coordinates[0][0]') AS DOUBLE) as longitude,
    CAST(JSON_EXTRACT(geometry, '$.coordinates[0][1]') AS DOUBLE) as latitude
FROM locations;
```

### Example 2: Array Aggregation and Filtering
```sql
SELECT 
    category,
    ARRAY_AGG(product_name) as all_products,
    ARRAY_DISTINCT(TRANSFORM(products, x -> x.brand)) as unique_brands,
    cardinality(FILTER(products, x -> x.price > 100)) as premium_count
FROM product_catalog
GROUP BY category;
```

### Example 3: Complex JSON Array Processing
```sql
SELECT 
    order_id,
    TRANSFORM(CAST(items AS ARRAY(JSON)), x -> json_extract_scalar(x, '$.product_id')) as product_ids,
    FILTER(CAST(items AS ARRAY(JSON)), x -> CAST(json_extract_scalar(x, '$.quantity') AS INTEGER) > 1) as bulk_items
FROM orders;
```