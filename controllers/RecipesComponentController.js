const recipeComponentService = require('../services/recipeComponentService');

exports.createRecipeComponent = async (req, res) => {
    try {
        const recipeComponent = await recipeComponentService.createRecipeComponent(req.body);
        res.status(201).json(recipeComponent);
    } catch (err) {
        res.status(500).json({ message: "สร้างสูตรอาหารไม่สำเร็จ", error: err.message });
    }
};

exports.getRecipeComponentById = async (req, res) => {
    try {
        const recipeComponent = await recipeComponentService.getRecipeComponentById(req.params.id);
        if (!recipeComponent) {
            return res.status(404).json({ message: "ไม่พบส่วนประกอบสูตรอาหาร" });
        }
        res.json(recipeComponent);
    } catch (err) {
        res.status(500).json({ message: "โหลดข้อมูลส่วนประกอบสูตรอาหารไม่สำเร็จ", error: err.message });
    }
};

exports.getAllRecipeComponents = async (req, res) => {
    try {
        const recipeComponents = await recipeComponentService.getAllRecipeComponents();
        res.json(recipeComponents);
    }
    catch (err) {
        res.status(500).json({ message: "โหลดข้อมูลส่วนประกอบสูตรอาหารไม่สำเร็จ", error: err.message });
    }
};
