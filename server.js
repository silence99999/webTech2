const express = require('express')
const fs = require('fs')

const app = express()
const PORT = 3000

app.use(express.json())

app.get('/',(req,res) => {
    res.send("server is running")
})

app.get('/hello',(req,res)=> {
    res.send({
        message:"Hello from server"
    })
})

app.get('/time',(req,res)=>{
    res.send(new Date())
})

app.get('/status',(req,res)=>{
    res.status(201).json({
        message:"some text"
    })
})

app.get('/items',(req,res)=>{
    fs.readFile("data.json",'utf-8',(err,data)=>{
        if (err) {
            return res.status(500).send("error reading file")
        }

        try {
            const items = JSON.parse(data)

            res.status(200).json(items)
        } catch (parseError) {
            console.error("error json parsing",parseError)
            return res.status(500).send("data file corrupted")
        }
    })
})

app.post('/items',(req,res) =>{
    const body = req.body

    if (!body || !body.product_name || !body.store_name || !body.model) {
        return res.status(400).send("Missing field")
    }

    let items

    try {
        items = readData()
    } catch (err) {
        return res.status(500).send("Error reading file data")
    }

    let maxId = 0
    for (let i = 0; i < items.length; i++) {
        if (items[i].id > maxId) {
            maxId = items[i].id;
        }
    }

    const newItem = {
        id: maxId+1,
        poduct_name:body.product_name,
        store_name:body.store_name,
        store_id:1,
        model:body.model
    }

    items.push(newItem)
    try {
        writeData(items)
    } catch (err) {
        return res.status(500).send("Error writing data")
    }

    res.status(201).json(items)
})


app.put('/item/:id',(req,res) => {
    const body = req.body
    const id = Number(req.params.id)
    let items

    try {
        items = readData()
    } catch(err) {
        res.status(500).send("Error reading data")
    }

    let item = null
    for (let i = 0;i < items.length;i++) {
        if (items[i].id === id) {
            item = items[i]
            break
        }
    }

    if (!item) {
        return res.status(400).send("Error finding product")
    }

    if (body.product_name !== undefined) {
        item.product_name = body.product_name
    }
    if (body.store_name !==  undefined) {
        item.store_name = body.store_name
    }
    if (body.model !== undefined) {
        item.model = body.model
    }



    try {
        writeData(items)
    } catch (err) {
        res.status(500).send("Error writing data")
    }

    res.status(200).json(item)
})

app.delete('/item/:id',(req,res)=> {
    const id = Number(req.params.id)

    let items

    try {
        items = readData()
    } catch (err) {
        res.status(500).send("Error reading data")
    }

    let idx = null

    for (let i = 0;items.length;i++) {
        if (items[i].id === id) {
            idx = i
            break
        }
    }

    if (idx == null) {
        res.status(404).send("item not found")
    }

    const deletedItem = items[idx]

    items.splice(idx,1)

    try {
        writeData(items)
    } catch (err) {
        res.status(500).send("Error writing data")
    }

    res.status(200).json({
        message:"Item deleted successfully",
        item:deletedItem
    })
})

function readData() {
    const raw = fs.readFileSync("data.json", "utf-8");
    return JSON.parse(raw);
}

function writeData(data) {
    fs.writeFileSync("data.json", JSON.stringify(data, null, 2));
}


app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
    console.log(`Access it at: http://localhost:${PORT}`);
});