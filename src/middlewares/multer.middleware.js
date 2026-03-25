import multer from "multer"
import path from "path"
import crypto from "crypto"
const storage=multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,"./public/temp")
    },
    filename:function(req,file,cb){
        try {
            //retirving extension to add end of the file name
            const ext=path.extname(file.originalname)
            //creating uniqueName
            const uniqueName=Date.now()+"-"+crypto.randomBytes(6).toString("hex")+ext;
            cb(null,uniqueName);
        } catch (error) {
            cb(error);
        }
    }
})
export const upload=multer({storage})