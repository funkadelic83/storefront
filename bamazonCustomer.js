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
    displayInventory();
})

function displayInventory() {
    console.log("Take a look at all the video equipment we have for sale!\n");
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;
        for (var i = 0; i < res.length; i++) {
            console.log(res[i].item_id + ": " + res[i].product_name + " costs $" + res[i].price + ". Quantity in stock: " + res[i].stock_quantity);
        }
        console.log("\n");
        buySomething();
    })
};

function buySomething() {
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;
        inquirer
            .prompt([
                {
                    name: "choice",
                    type: "rawlist",
                    choices: function () {
                        var choiceArray = [];
                        for (var i = 0; i < res.length; i++) {
                            choiceArray.push(res[i].product_name);
                        }
                        return choiceArray;
                    },
                    message: "What item would you like to buy?\n"
                },
                {
                    name: "quantity",
                    type: "input",
                    message: "How many would you like to buy?\n"
                }
            ])
            .then(function (answer) {
                var chosenItem;
                for (var i = 0; i < res.length; i++) {
                    if (res[i].product_name === answer.choice) {
                        chosenItem = res[i];
                    }
                }
                if (chosenItem.stock_quantity >= parseInt(answer.quantity)) {
                    console.log("They have enough. Sold!\n");
                    var newQuantity = (chosenItem.stock_quantity - parseInt(answer.quantity));
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
                        function(error) {
                            if (error) throw err;
                            console.log("Store inventory updated!\n");
                            var totalCost = (chosenItem.price * answer.quantity);
                            console.log("The total cost of your purchase is: " + totalCost + ".\n");
                            // process.exit()
                            buySomething();
                        }
                    );
                } else {
                    console.log("They don't have enough. They have " + chosenItem.stock_quantity + " in stock.\n");
                    buySomething();
                }
            });
    })
};