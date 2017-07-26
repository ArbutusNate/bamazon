var inquire = require('inquirer');
var mysql = require('mysql');
var table = require('table');

// Connection to Local Host
var connection = mysql.createConnection({
  host:'localhost',
  port: 3306,
  user: 'root',
  password: 'admin',
  database: 'bamazon'
});

// Inquire Tree
function InquireTree(){
  inquire.prompt([{
    type: 'list',
    name: 'userAdmin',
    message: 'Are you a user or an admin?',
    choices:['1) User', '2) Admin', '3) Supervisor']
    }]).then(function(response){
      switch(response.userAdmin) {
        case '1) User':
          Lookup();
          break;
        case '2) Admin':
          AdminActions();
          break;
        case '3) Supervisor':
          SupervisorActions();
          break
      }
    });
}
// Functions
function SupervisorActions() {
  inquire.prompt([{
    type:"list",
    name:"superChoice",
    message:"What would you like to do?",
    choices: ['View product sales by department',
    'Create new department']
  }]).then(function(response){
    switch(response.superChoice) {
      case 'View product sales by department':
        connection.query('SELECT departments.department_id AS ID, departments.department_name AS Department, departments.over_head_costs AS Overhead, products.sales AS product_sales, sum(products.sales - departments.over_head_costs) AS total_profit FROM departments JOIN products ON departments.department_name = products.department_name GROUP BY departments.department_name',
                          function(err,res){
                            if(!err){
                              console.log(res);
                            } else {
                              throw err;
                            }
                          })
        break;
      case 'Create new department':
        inquire.prompt([
          {name: 'newDept',
          message: 'Name of new department:'},
          {name: 'newOverhead',
          message: 'How much overhead?'}
        ]).then(function(response){
          connection.query('INSERT INTO departments SET ?',
            [{department_name: response.newDept,
            over_head_costs: parseInt(response.newOverhead)}],
            function(err,res){
              if(!err){
                console.log("New department, " + response.newDept + ", created with estimated overhead of $" + response.newOverhead);
              } else {
                throw err;
              }
            })
        })
        break;
    }
  })
}

function AdminActions(){
  inquire.prompt([{
    type: 'list',
    name: 'adminChoice',
    message: 'What would you like to do?',
    choices: ['View products for sale',
    'View low inventory',
    'Add to inventory',
    'Add new product']
  }]).then(function(response){
    switch(response.adminChoice) {
      case 'View products for sale':
        connection.query('SELECT * FROM products', function(err,res){
          MapRes(res);
          InquireTree();
         });
        break;
      case 'View low inventory':
        connection.query('SELECT * FROM products WHERE stock_quantity < 5', function(err,res){
          MapRes(res);
          InquireTree();
        });
        break;
      case 'Add to inventory':
        inquire.prompt([
          {name: 'idToUpdate',
          message: 'ID of product you would like to update:'},
          {name: 'quantToUpdate',
          message: 'How many would you like to add to stock?'}
          ]).then(function(response){
            connection.query('UPDATE products SET ? + stock_quantity WHERE ?',
             [{
                stock_quantity : response.quantToUpdate
             },
             {
               id : response.idToUpdate
             }],
             function(err,res){
              if(!err){
                GetAdminList();
                InquireTree();
              } else {
                throw err;
              }
            });
          });
        break;
      case 'Add new product':
          inquire.prompt([
            {name: 'newProd',
            message: 'Name of new product'},
            {name: 'newDept',
            message: 'Which department?'},
            {name: 'newPrice',
            message: 'Price of new item'},
            {name: 'newStock',
            message: 'How many?'}
            ]).then(function(response){
              connection.query('INSERT INTO products SET ?',
                [
                {product_name : response.newProd,
                department_name : response.newDept,
                price: parseInt(response.newPrice),
                stock_quantity: parseInt(response.newStock)
                }], function(err,res) {
                  if(!err){
                    console.log('Done!')
                    InquireTree();
                  } else {
                    console.log(err)
                  }
                }
              )
            })
        break;
    }
  });
}

function GetAdminList(){
  connection.query('SELECT * FROM products', function(err,res){
    if(!err){
      MapRes(res);
    } else {
      throw err;
    }
  })
}

function MapRes(res){
  var adminList = res.map(function(y){
    return console.log('ID: ' + y.id + ' | ' + y.product_name + ' | ' + y.department_name + ' | $' + y.price + ' | ' + y.stock_quantity);
  })
}

function Lookup(){
  connection.query('SELECT * FROM products', function(err, res){
    if(!err){
      // console.log(res)
      console.log('List of Available Products:');
      var custList = res.map(function(x){
        return console.log('ID:' + x.id + ' | ' + x.product_name + ' | $' + x.price);
      });
      var maxNum = custList.length;
      inquire.prompt([
        {name: 'userChoice',
        message: 'Enter ID of product you wish to buy.'},
        {name: 'userQuant',
        message: 'How many do you want?'}
      ]).then(function(response){
          connection.query('SELECT * FROM products WHERE ?',
          [{ id : response.userChoice }],
          function(err, res){
            var currentStock = res[0].stock_quantity;
            var currentSales = res[0].sales;
            var sold = response.userQuant;
            var totalCost = res[0].price * sold;
            var priceToUser = res[0].price;
            if(currentStock - sold < 0 && sold != NaN){
              console.log('Insufficient Stock!');
              InquireTree();
            } else {
              console.log('Processing sale...');
              connection.query('UPDATE products SET ? WHERE ?',
                [{  stock_quantity : currentStock - sold,
                    sales : currentSales + totalCost },
                {   id : response.userChoice }],
              function(err,res){
                if(!err){
                  console.log('Price per unit: ' + priceToUser + '. Cost for order: ' + totalCost);
                  console.log('Sale Successful!');
                  InquireTree();
                } else {
                  throw err;
                }
              });

            }
          });
      });
    } else {
      throw err;
    }
  });
}

InquireTree();


// whut