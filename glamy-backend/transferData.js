const fs = require('fs');
const mysql = require('mysql2/promise'); // Use promise-based API for transactions

async function transferData() {
  // Read JSON data
  const items = JSON.parse(fs.readFileSync('C:/Users/Fahad/Desktop/Glamy/Glamy final/my-app/src/data/items.json', 'utf8'));

  // Create a MySQL connection
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root', // replace with your MySQL username
    password: '123456', // replace with your MySQL password
    database: 'glamy'
  });

  try {
    // Start a transaction
    await connection.beginTransaction();

    // Insert data into the products table
    for (const item of items) {
      const query = `
        INSERT INTO products (name, description, price, color, stock, size, rating, is_featured, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const values = [
        item.name,
        item.description,
        item.price,
        item.color,
        item.stock,
        item.size,
        item.rating,
        false, // Assuming is_featured is false by default
        'Active' // Assuming status is Active by default
      ];

      await connection.query(query, values);
    }

    // Commit the transaction
    await connection.commit();
    console.log('All data successfully transferred.');

  } catch (err) {
    // Rollback the transaction in case of error
    await connection.rollback();
    console.error('Error occurred, transaction rolled back:', err);
  } finally {
    // Close the connection
    await connection.end();
  }
}

async function addImages() {
  // Read JSON data
  const items = JSON.parse(fs.readFileSync('C:/Users/Fahad/Desktop/Glamy/Glamy final/my-app/src/data/items.json', 'utf8'));

  // Create a MySQL connection
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root', // replace with your MySQL username
    password: '123456', // replace with your MySQL password
    database: 'glamy'
  });

  try {
    // Start a transaction
    await connection.beginTransaction();

    // Insert image URLs into the product_images table
    for (const item of items) {
      // Use item.id to match the product_id in the database
      const productId = item.id;

      // Assuming each item has a single image URL in the 'url' field
      const imageUrl = item.url;
      if (imageUrl) {
        const imageQuery = `
          INSERT INTO product_images (product_id, image_url)
          VALUES (?, ?)
        `;
        console.log(`Executing query: ${imageQuery} with values: [${productId}, ${imageUrl}]`);
        await connection.query(imageQuery, [productId, imageUrl]);
      }
    }

    // Commit the transaction
    await connection.commit();
    console.log('All images successfully added.');

  } catch (err) {
    // Rollback the transaction in case of error
    await connection.rollback();
    console.error('Error occurred, transaction rolled back:', err);
  } finally {
    // Close the connection
    await connection.end();
  }
}

transferData().catch(err => console.error('Unexpected error:', err));
addImages().catch(err => console.error('Unexpected error:', err));
