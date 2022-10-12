const { response } = require('express');
const express = require('express');
const { v4: uuidv4 } = require("uuid")

const app = express();
app.use(express.json());
const customers = [];

//Middleware
function verifyExistAccountCPF(req, res, next){
    const { cpf } = req.headers;

    const customer = customers.find(costumer => costumer.cpf == cpf);
    
    if(!customer){
        return res.status(400).json({error: "Customer not found"})
    }

    req.customer = customer;

    return next();
}

app.post("/account", (req,res) => {
    const {cpf, name} = req.body;

    const customerAlreadyExists = customers.some(
        customer => customer.cpf === cpf
    )
    
    if(customerAlreadyExists){
        return res.status(400).json({error: "Costomer already existis!"})
    }
    
    customers.push({
        cpf,
        name,
        id: uuidv4(),
        statement: []
    })

    return res.send(201).send();
})

// app.use(verifyExistAccountCPF)
app.get("/statement", verifyExistAccountCPF, (req, res) => {
    const { customer } = req

    return res.json(customer.statement)
})

app.post("/deposit", verifyExistAccountCPF, (req, res) => {
    const { description, amount } = req.body;

    const { customer } = req;

    const statementeOperation = {
        description,
        amount,
        created_at: new Date(),
        type: "credit"
    }

    customer.statement.push(statementeOperation);

    return res.status(201).send();
})


app.listen(3333);