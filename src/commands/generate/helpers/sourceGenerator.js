const fs = require('fs');
const path = require('path');

class GenerateSources {
    generateSources(outputDir) {
        let configs;
        try {
            const configFilePath = path.join(process.cwd(), 'config.json');
            const configString = fs.readFileSync(configFilePath, 'utf8');
            configs = JSON.parse(configString);
        } catch (e) {
            throw new Error('config.json file does not exist.');
        }
        
        if (configs) {
            configs.forEach((config) => {
                config.artifacts.forEach((artifact) => {
                    if (artifact.dependencyOnly) {
                        return;
                    }
                    const { additionsPath, transformPath } = this.createDirsIfNotExist(outputDir, artifact);

                    const defaultFilesToCopyPath = path.join(process.cwd(), 'sourceGenerationFiles');
                    const defaultAdditionFilesPath = path.join(defaultFilesToCopyPath, 'Additions');
                    fs.writeFileSync(
                        path.join(additionsPath, 'AboutAdditions.txt'),
                        fs.readFileSync(path.join(defaultAdditionFilesPath, 'AboutAdditions.txt'))
                    );

                    const defaultTransformFilesPath = path.join(defaultFilesToCopyPath, 'Transforms');
                    const transformFilesToCopy = fs.readdirSync(defaultTransformFilesPath);
                    transformFilesToCopy.forEach((file) => {
                        const filePath = path.join(defaultTransformFilesPath, file);
                        const fileStat = fs.statSync(filePath);
                        if (fileStat.isDirectory()) {
                            return;
                        }

                        fs.writeFileSync(
                            path.join(transformPath, file),
                            fs.readFileSync(filePath)
                        );
                    })
                })
            });
        }
    }

    createDirsIfNotExist(outputDir, artifact) {
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir);
        }
        const groupPath = path.join(outputDir, artifact.groupId);
        if(!fs.existsSync(groupPath)) {
            fs.mkdirSync(groupPath);
        }
        const artifactPath = path.join(groupPath, artifact.artifactId);
        if(!fs.existsSync(artifactPath)) {
            fs.mkdirSync(artifactPath);
        }
        const transformPath = path.join(artifactPath, 'Transforms');
        if(!fs.existsSync(transformPath)) {
            fs.mkdirSync(transformPath);
        }
        const additionsPath = path.join(artifactPath, 'Additions');
        if(!fs.existsSync(additionsPath)) {
            fs.mkdirSync(additionsPath);
        }
        return {
            groupPath,
            artifactPath,
            transformPath,
            additionsPath
        }
    }
}

module.exports = new GenerateSources();