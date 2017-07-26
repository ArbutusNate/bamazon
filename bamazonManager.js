var inquire = require('inquirer');
var mysql = require('mysql');
var table = require('table');

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
    choices:['1) User', '2) Admin']
    }]).then(function(response){
      if (response.userAdmin === '2) Admin'){
        AdminActions();
      }
      if (response.userAdmin === '1) User'){
        Lookup();
      }
    });
}
// Functions


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
        if (response.adminChoice === 'View products for sale'){
          connection.query('SELECT * FROM products', function(err,res){
            MapRes(res);
            InquireTree();
          });
        }
        if (response.adminChoice === 'View low inventory'){
          connection.query('SELECT * FROM products WHERE stock_quantity < 5', function(err,res){
            MapRes(res);
            InquireTree();
          });
        }
        if (response.adminChoice === 'Add to inventory'){
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
        }
        if(response.adminChoice === 'Add new product'){
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
          connection.query('SELECT * FROM products WHERE id =' + response.userChoice + '', function(err, res){
            if(res[0].stock_quantity - response.userQuant < 0 && response.userQuant != NaN){
              console.log('Insufficient Stock!');
              InquireTree();
            } else {
              console.log('Processing sale...');
              connection.query('UPDATE products SET stock_quantity = stock_quantity - ' + response.userQuant + ' WHERE id =' + response.userChoice + '');
              console.log('Price per unit: ' + res[0].price + '. Cost for order: ' + res[0].price * response.userQuant);
              console.log('Sale Successful!');
              InquireTree();
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