const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema(
  {
    mainCategory:{type:String,required:true},

    subCategory: {type:Array}
     

  },
  { timestamps: true }
);

module.exports = mongoose.model("Category", CategorySchema);