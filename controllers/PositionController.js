const positionModel = require('../models/PositionModel')

exports.createPosition = async (req, res) => {
    try{
        const position_name = req.body;
        const newPosition = new positionModel({
              position_name
         });
         await newPosition.save();
         res.status(201).json(newCategory);
    }catch{}
    
}

exports.getAllPositions = async (req, res) => {
    try{
        const positions = await positionModel.find({ deletedAt: null });
        res.status(200).json(positions);
    }catch(error){
        res.status(500).json({ message: error.message });
    }
}

exports.updatePosition = async (req, res) => {
    try{
        const positionId = req.params.id;
        const { position_name } = req.body;
        const position = await positionModel.findById(positionId);
        if(!position || position.deletedAt){
            return res.status(404).json({ message: 'Position not found' });
        }
        position.position_name = position_name || position.position_name;
        await position.save();
        res.status(200).json(position);
    }catch(error){
        res.status(500).json({ message: error.message });
    }
}

exports.deletePosition = async (req, res) => {
    try{
        const positionId = req.params.id;
        const position = await positionModel.findById(positionId);
        if(!position || position.deletedAt){
            return res.status(404).json({ message: 'Position not found' });
        }
        position.deletedAt = new Date();
        await position.save();
        res.status(200).json({ message: 'Position deleted successfully' });
    }catch(error){
        res.status(500).json({ message: error.message });
    }
}

