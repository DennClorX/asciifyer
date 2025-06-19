const fs = require('node:fs');
const axios = require('axios');

export let fonts = {
    "Doom": "Doom",
    "Slant": "Slant",
    "StarWars": "Star Wars",
    "ANSIRegular": "ANSI Regular",
    "ANSIShadow": "ANSI Shadow",
    "IIIDASCII": "3D-ASCII",
    "DeltaCorpsPriest": "Delta Corps Priest 1",
    "DOSRebel": "DOS Rebel",
    "Georgia11": "Georgia11",
    "Univers": "Univers",
    "stencil": "stencil",

}

async function downloadFont(font) {
    const res = await axios.get(`https://raw.githubusercontent.com/DennClorX/asciifyer/refs/heads/main/Fonts/${font}.flf`, { responseType: "arraybuffer" });
    await fs.promises.writeFile(`./Fonts/${font}.flf`, res.data);
}

export async function clearFonts() {
    const files = await fs.promises.readdir('./Fonts');
    for (const file of files) {
        if (file.endsWith('.flf')) {
            await fs.promises.unlink(`./Fonts/${file}`);
        }
    }
}
export async function stringToAscii(text, font) {
    let flfContent
    try {
        flfContent = fs.readFileSync(`./Fonts/${font}.flf`, { encoding: 'utf8' });
    } catch {
        await downloadFont(font);
        flfContent = fs.readFileSync(`./Fonts/${font}.flf`, { encoding: 'utf8' });

    }

    const lines = flfContent.split('\n');
    const header = lines[0].split(' ');
    const hardblank = header[0].slice(-1);
    const height = parseInt(header[1], 10);
    const commentLines = parseInt(header[5], 10);

    const letters = {};
    let charCode = 32;
    let i = commentLines + 1;
    while (i < lines.length && charCode <= 126) {
        let charLines = [];
        for (let h = 0; h < height; h++, i++) {
            let line = lines[i];
            if (!line) continue;
            let endMarker = line.match(/(.)\s*$/)?.[1] || '@';
            line = line.replace(new RegExp(`\\${endMarker}+$`), '');
            line = line.replace(new RegExp(`\\${hardblank}`, 'g'), ' ');
            charLines.push(line);
        }
        letters[String.fromCharCode(charCode)] = charLines;
        charCode++;
    }

    const output = Array(height).fill('');
    for (const char of text) {
        const glyph = letters[char] || letters['?'] || Array(height).fill(' ');
        for (let h = 0; h < height; h++) {
            output[h] += (glyph[h] || ' '.repeat(glyph[0]?.length || 1));
        }
    }
    return output.join('\n');
}
