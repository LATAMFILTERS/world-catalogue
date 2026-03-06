const express = require("express");

const app = express();
app.use(express.json());

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function getHoleCount(D) {
  if (D < 65) return 6;
  if (D < 95) return 8;
  if (D < 130) return 10;
  return 12;
}

function buildThread(thread_geometry) {
  if (!thread_geometry) return null;

  if (thread_geometry.standard === "Metric") {
    const pitch = thread_geometry.pitch_mm;
    return {
      major_diameter: parseFloat(thread_geometry.thread_size),
      pitch_mm: pitch,
      depth_mm: pitch * 0.65,
      render_mode: "mechanically_coherent_no_smoothing"
    };
  }

  if (thread_geometry.standard === "UN") {
    const tpi = thread_geometry.tpi;
    const pitch = 25.4 / tpi;
    return {
      major_diameter: null,
      pitch_mm: pitch,
      depth_mm: pitch * 0.65,
      render_mode: "mechanically_coherent_no_smoothing"
    };
  }

  return null;
}

function generateHorizontalRender(data) {

  const D = data.geometry_master.outer_diameter_mm;
  const H = data.geometry_master.height_mm;
  const G_OD = data.gasket_od_mm_numeric;
  const G_ID = data.gasket_id_mm_numeric;

  const holeCount = getHoleCount(D);

  return {
    type: "horizontal_engineering_view",
    shell: {
      diameter: D,
      length: H,
      finish: "K90_industrial_powder_coat"
    },
    base_plate: {
      outer_diameter: D * 0.92,
      thickness: clamp(D * 0.06, 4, 10),
      material: "machined_steel_satin"
    },
    holes: {
      count: holeCount,
      diameter: clamp(D * 0.08, 5, 14),
      circle_diameter: G_ID + ((G_OD - G_ID) * 0.55),
      pattern: "circular_even_distribution"
    },
    thread: buildThread(data.thread_geometry),
    gasket: {
      outer_diameter: G_OD,
      inner_diameter: G_ID,
      thickness: D * 0.04,
      material: "nitrile_black_matte"
    },
    render_settings: {
      background: "pure_white",
      branding: false,
      orientation: "horizontal"
    }
  };
}

app.get("/health", (req, res) => {
  res.json({ status: "OK", engine: "spin_on_v2" });
});

app.post("/spin_on", (req, res) => {
  try {
    const {
      sku,
      geometry_master,
      thread_geometry,
      gasket_od_mm_numeric,
      gasket_id_mm_numeric
    } = req.body;

    if (
      !sku ||
      !geometry_master ||
      !thread_geometry ||
      !gasket_od_mm_numeric ||
      !gasket_id_mm_numeric
    ) {
      return res.status(400).json({
        agent: "spin_on_engine",
        status: "ERROR",
        message: "Missing required data for horizontal render"
      });
    }

    const horizontal_render_definition = generateHorizontalRender({
      geometry_master,
      thread_geometry,
      gasket_od_mm_numeric,
      gasket_id_mm_numeric
    });

    const result = {
      agent: "spin_on_engine",
      status: "OK",
      sku,
      geometry_master,
      thread_geometry,
      horizontal_render_definition
    };

    res.json(result);

  } catch (err) {
    res.status(500).json({
      agent: "spin_on_engine",
      status: "ERROR",
      error: err.message
    });
  }
});

const PORT = 3001;

app.listen(PORT, () => {
  console.log("Spin On Engine v2 running on port " + PORT);
});