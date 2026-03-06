const express = require("express");
const app = express();
app.use(express.json());

app.post("/qc", (req, res) => {
    const data = req.body;

    if (!data.image_url) {
        return res.json({
            agent: "qc_engine",
            status: "FAIL",
            confidence_score: 0
        });
    }

    return res.json({
        agent: "qc_engine",
        status: "PASS",
        confidence_score: 0.98
    });
});

app.listen(3003, () => {
    console.log("QC Engine running on port 3003");
});