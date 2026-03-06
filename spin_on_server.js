const express = require("express");
const app = express();
app.use(express.json());

app.post("/spin_on", (req, res) => {
    const data = req.body;

    if (!data.geometry_master || !data.thread_geometry) {
        return res.json({
            agent: "spin_on_engine",
            status: "ERROR"
        });
    }

    return res.json({
        agent: "spin_on_engine",
        status: "OK",
        ...data
    });
});

app.listen(3001, () => {
    console.log("Spin On Engine running on port 3001");
});