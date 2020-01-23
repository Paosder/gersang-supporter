
import * as fs from 'fs';
import { app } from 'electron';
import * as fsj from 'fs-jetpack';

// https://gist.github.com/coclav/4fd17efc9efa2c0517b2

// example usage :
// copyFileOutsideOfElectronAsar( "myFolderInsideTheAsarFile", app.getPath("temp") + "com.bla.bla"

const copyFileOutsideOfElectronAsar = (sourceInAsarArchive, destOutsideAsarArchive) => {
  if (fs.existsSync(`${app.getAppPath()}/${sourceInAsarArchive}`)) {
    // file will be copied
    if (fs.statSync(`${app.getAppPath()}/${sourceInAsarArchive}`).isFile()) {
      fsj.file(destOutsideAsarArchive, {
        content: fs.readFileSync(`${app.getAppPath()}/${sourceInAsarArchive}`),
      });
    } else if (fs.statSync(`${app.getAppPath()}/${sourceInAsarArchive}`).isDirectory()) { // dir browsed
      fs.readdirSync(`${app.getAppPath()}/${sourceInAsarArchive}`).forEach((fileOrFolderName) => {
        copyFileOutsideOfElectronAsar(`${sourceInAsarArchive}/${fileOrFolderName}`, `${destOutsideAsarArchive}/${fileOrFolderName}`);
      });
    }
  }
};

export default copyFileOutsideOfElectronAsar;
