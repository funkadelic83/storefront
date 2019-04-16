var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "mike",
    password: "$aTan6969videoL0rd$",
    database: "bamazon"
});

connection.connect(function (err) {
    if (err) throw err;
    // console.log("Connected as ID " + connection.threadID + ".\n");
    takeAction();
})

function takeAction() {
    inquirer
        .prompt([
            {
                name: "action",
                type: "rawlist",
                choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product"],
                message: "What would you like to do?\n"
            }
        ])
        .then(function (answer) {
            // console.log("Works so far!");
            if (answer.action === "View Products for Sale") {
                // console.log("Choice 1 has been chosen\n");
                connection.query("SELECT * FROM products", function (err, res) {
                    if (err) throw err;
                    console.log("\n");
                    for (var i = 0; i < res.length; i++) {
                        console.log(res[i].item_id + ": " + res[i].product_name + " costs $" + res[i].price + ". Quantity: " + res[i].stock_quantity);
                    }
                });
                console.log("\n");
                takeAction();
            } else if (answer.action === "View Low Inventory") {
                console.log("The following items are low on inventory: \n");

                connection.query("SELECT * FROM products", function (err, res) {
                    if (err) throw err;
                    for (var i = 0; i < res.length; i++) {
                        // console.log(res);
                        if (res[i].stock_quantity < 5) {
                            console.log(res[i].product_name + " | Quantity: " + res[i].stock_quantity);
                        }
                    }
                    takeAction();
                })

            } else if (answer.action === "Add to Inventory") {
                console.log("Adding to inventory: \n");

                connection.query("SELECT * FROM products", function (err, res) {
                    if (err) throw err;

                    inquirer
                        .prompt([
                            {
                                name: "add",
                                type: "rawlist",
                                choices: function () {
                                    var addArray = [];
                                    for (var i = 0; i < res.length; i++) {
                                        addArray.push(res[i].product_name);
                                    }
                                    return addArray;
                                },
                                message: "What item would you like to add inventory for?\n"
                            },
                            {
                                name: "quantity",
                                type: "input",
                                message: "How many would you like to add?\n"
                            }
                        ])
                        .then(function (answer) {
                            var chosenItem;
                            for (var i = 0; i < res.length; i++) {
                                if (res[i].product_name === answer.add) {
                                    chosenItem = res[i];
                                    var newQuantity = (parseInt(chosenItem.stock_quantity) + parseInt(answer.quantity));
                                }
                            }
                            connection.query(
                                "UPDATE products SET ? WHERE ?",
                                [
                                    {
                                        stock_quantity: newQuantity
                                    },
                                    {
                                        item_id: chosenItem.item_id
                                    }
                                ],
                                function (error) {
                                    if (error) throw err;
                                    console.log("Quantity Updated Successfully!\n");
                                    console.log("New quantity: " + newQuantity + ".\n");
                                    takeAction();
                                }
                            )

                        }
                        )
                }
                )






} else if (answer.action === "Add New Product") {
                console.log("Add a new product:\n");
                inquirer
                    .prompt([
                        {
                            name: "newitem",
                            type: "input",
                            message: "What item would you like to add to the store?\n"
                        },
                        {
                            name: "department",
                            type: "input",
                            message: "What department does it belong in?\n",
                        },
                        {
                            name: "newitemPrice",
                            type: "input",
                            message: "What is the price?\n",
                        },
                        {
                            name: "newitemQuantity",
                            type: "input",
                            message: "How many are available for sale?\n"
                        }
                    ]).then(function (answer) {
                        console.log("Adding item to inventory...\n");
                        var query = connection.query(
                            "INSERT INTO products SET ?",
                            {
                                product_name: answer.newitem,
                                department_name: answer.department,
                                price: answer.newitemPrice,
                                stock_quantity: answer.newitemQuantity
                            },
                            function (err, res) {
                                console.log(res.affectedRows + " product inserted!\n");
                                takeAction();
                            }
                        )


                    });










            }
        })
}