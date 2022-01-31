const mongoose = require ('mongoose');


module.exports={
    dbConnect:(url)=>{
        mongoose.connect(url).then(()=>{
            console.log('Database connected successfully');
        }).catch((err)=>{
            console.log('Db error',err);
        })
    }
}

