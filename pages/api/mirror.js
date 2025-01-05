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
    const fs = require("fs");
    const formidable = require("formidable");
    const path = require("path");

    require('dotenv').config();
    const configuration = new Configuration({
        apiKey: process.env.OPENAI_API_KEY2,
    });
    const openai = new OpenAIApi(configuration);

    const getFormDataImage = async () => {
        const form = new formidable.IncomingForm();
        form.maxFileSize = 5 * 1024 * 1024; // 5MB
        form.keepExtensions = true;

        form.parse(req, async (err, fields, files) => {
            if (err) {
                console.error('File parse error:', err);
                return res.status(400).json({
                    status: 'Fail',
                    message: 'Error parsing files',
                    error: err,
                });
            }

            const filePath = files.selfie.filepath;
            console.log(`File path: ${filePath}`);

            try {
                await generateImage(filePath); // Pass the image filepath
            } catch (error) {
                console.error('Image generation error:', error);
                return res.status(500).json({ error: error.message });
            }
        });
    };

    const FormData = require("form-data");

    const generateImage = async (filePath) => {
        try {
            const form = new FormData();
            form.append("image", fs.createReadStream(filePath), {
                filename: path.basename(filePath),
                contentType: "image/png", // Update this if your file is a different type
            });

            const response = await openai.createImageVariation(
                form,
                3, // Number of variations
                "256x256" // Size of the variations
            );

            const variants = response.data.data.map((data) => data.url);

            res.status(200).json({
                status: 'Success',
                variants,
            });
        } catch (error) {
            console.error("Error creating image variation:", error);
            res.status(500).json({ error: error.message });
        }
    };

    getFormDataImage();
}