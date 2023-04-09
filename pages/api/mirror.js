// Allow us to handle multipart form data
export const config = {
    api: {
        bodyParser: false
    }
};

// Generate image variants from an uploaded image
export default function handler(req, res) {
    // Setup OpenAI
    const { Configuration, OpenAIApi } = require("openai");
    
    require('dotenv').config();
    const configuration = new Configuration({
        apiKey: process.env.OPENAI_API_KEY2,
    });
    const openai = new OpenAIApi(configuration);

    // Setup form data handling
    const fs = require("fs");
    const formidable = require("formidable");

    const getFormDataImage = async() => {
        const form = new formidable.IncomingForm();
        form.maxFileSize = 50 * 1024 * 1024; // 5MB
        form.KeepExtensions = true;
        //form.uploadDir = "public/upload"; // don't do this, just use the default for vercel prod

        form.parse(req, async(err, fields, files) => {
            if(err) {
                console.log('File parse error');
                console.log(err);
                return res.status(400).json({
                    status: 'Fail',
                    message: 'Error parsing files',
                    error: err
                });
            }
            
            const filePath = files.selfie.filepath;
            console.log(filePath);

            try {
                generateImage(filePath); //pass the image filename
            } catch (error) {
                console.log(error);
                console.log("Error");
                res.json({
                    error
                });
            }

        });
    };

    var variants = [];
    const generateImage = async(filePath) => {
        // read the file into a buffer as we can't store data on vercel
        var buffer = fs.readFileSync(filePath);
        buffer.name = "image.png";
        const response = await openai.createImageVariation(
            buffer,
            3,
            "256x256"
        ).then(function(response) {
            response.data.data.forEach((data, index) => {
                variants[index] = data.url;
            });

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json({ process: 'Mirror', variants: variants });
        }).catch(function(error) {
            console.log(error);
        });

    };
    getFormDataImage();
}