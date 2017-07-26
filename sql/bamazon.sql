DROP SCHEMA IF EXISTS bamazon;
CREATE DATABASE bamazon;

USE bamazon;

CREATE TABLE products(
id INTEGER(8) AUTO_INCREMENT NOT NULL,
product_name VARCHAR(30) NOT NULL,
department_name VARCHAR(30),
price DECIMAL(6, 2) NOT NULL,
stock_quantity INTEGER(5) NOT NULL,
sales INTEGER(5),
PRIMARY KEY (id)
);

CREATE TABLE departments(
department_id INTEGER(8) AUTO_INCREMENT NOT NULL,
department_name VARCHAR(50) NOT NULL,
over_head_costs INTEGER(10) NOT NULL,
PRIMARY KEY (department_id)
);

INSERT INTO departments (department_name, over_head_costs)
VALUES
("food", 50),
("clothing", 60),
("kitchen", 75),
("furniture", 85),
("tech", 95);



INSERT INTO products (product_name, department_name, price, stock_quantity, sales)
VALUES
("bread", "food", 4.00, 10, 0),
("cheese", "food", 5.00, 150, 0),
("shirt", "clothing", 12.00, 100, 0),
("pants", "clothing", 40.00, 200, 0),
("frying pan", "kitchen", 23.00, 225, 0),
("cutting board", "kitchen", 17.00, 75, 0),
("chair", "furniture", 100.00, 5, 0),
("rug", "furniture", 150.00, 50, 0),
("table", "furniture", 200.00, 47, 0),
("phone", "tech", 350.00, 125, 0),
("laptop", "tech", 500.00, 3, 0);


SELECT * FROM products;
SELECT * FROM departments;

UPDATE products SET stock_quantity = 2 WHERE id = 1;

UPDATE products SET stock_quantity = 10 WHERE id = 1;