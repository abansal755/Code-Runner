const fs = require('fs/promises');

(async function(){
    await fs.rmdir('./files',{recursive: true});
})();