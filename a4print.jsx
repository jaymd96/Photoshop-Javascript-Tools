#include util.jsxinc

// Set a script name
var scriptName = {
    en: "empty",
    de: "Beispiel-Skript"
};

function assert(condition, message) {
    if (!condition) {
        throw new Error(message || "Assertion failed");
    }
}

function isBetweenInclusive(value, min, max){
    return value >= min && value <= max;
}

function chunkInto(arr, count){
    function popMultiple(array, _count){
        var poppedItems = [] ;
        for (var i = 0; i < _count; i++){
            if (array.length > 0){
                poppedItems.push(array.pop())
            }
            else {
                break;
            }
        }
        return poppedItems;
    }
    var chunkArray = [];
    var numChunk = Math.ceil(arr.length / count);
    for (var idx = 0; idx < numChunk; idx++){
        currentChunk = popMultiple(arr, count);
        chunkArray.push(currentChunk);
    }
    return chunkArray
}

function placeHolderName(number){
        assert(isBetweenInclusive(number, 0, 5), "Only 6 PlaceHolder Positions, Indexed on 0")
        return "Card"+number
}

// Copied from Single Card Generation Script
// THIS IS CANDIDATE FOR CODE REDUCTION
// HELPER FUNCTIONS
function readFile(path) {
    var file = new File(path);
    file.open("r");
    var content = file.read();
    file.close();
    return content;
}

function readObjectsFromJson(filename) {
    try {
        var jsonText = readFile(filename);
        var objects = eval("(" + jsonText + ")")
        return objects;
    } catch (e) {
        $.writeln(e);
        return null;
    }
}

function buildFilename(origname, name, index, suffix) {
    var filename = extractFilestart(origname)
    if (index !== undefined) filename += "-gen-" + zeropad(index)
    if (name !== undefined) filename += "-" + filesc(name)
    if (suffix !== undefined) filename += "." + suffix
    return new File(filename);
}

function extractFilestart(origname) {
    return origname.path + "/" + removeFileExtension(origname.name);
}

function filesc(str) {
    return (str + '')
        .toLowerCase()
        .replace('�', 'oe')
        .replace('�', 'ae')
        .replace('�', 'ue')
        .replace('�', 'ss')
        .replace(/[^0-9A-Za-z]+/g, '-')
        .replace(/^-|-$/g, '');
}

function zeropad(n, anz) {
    anz = anz || 5;
    var digitAnz = n == 0 ? 1 : Math.floor(Math.log(n) / Math.log(10)) + 1;
    return new Array(anz - digitAnz + 1).join('0') + n;
}

function removeFileExtension(filename) {
    // http://stackoverflow.com/questions/1818310/regular-expression-to-remove-a-files-extension
    return filename.substr(0, filename.lastIndexOf('.')) || filename;
}

function replaceContents(newFile, theSO) {
    app.activeDocument.activeLayer = theSO;
    var idplacedLayerReplaceContents = stringIDToTypeID("placedLayerReplaceContents");
    var desc3 = new ActionDescriptor();
    var idnull = charIDToTypeID("null");
    desc3.putPath(idnull, new File(newFile));
    var idPgNm = charIDToTypeID("PgNm");
    desc3.putInteger(idPgNm, 1);
    executeAction(idplacedLayerReplaceContents, desc3, DialogModes.NO);
    return app.activeDocument.activeLayer;
};


// Saving options
// COPIED FROM OTHER FILE TOO
var psdOpts = new PhotoshopSaveOptions();
var jpgOpts = new JPEGSaveOptions();
jpgOpts.embedColorProfile = true;
jpgOpts.quality = 12; // highest

// Define the directory to search
var dirPath = "/Users/jamesmason-drust/Desktop/Photoshop-Javascript-Tools/output"; // For Generating Main Deck
// var dirPath = "/Users/jamesmason-drust/Desktop/Photoshop-Javascript-Tools/cardBack"; // For Generating Card Back A4

var directory = new Folder(dirPath);

// Define the filename format (e.g., all .jpg files)
var filenameFormat = /\.jpg$/i; // Change the regex to match your format

// Function to filter files based on the filename format
function fileFilter(file) {
    return file instanceof File && filenameFormat.test(file.name);
}

// Get all files in the directory with the specified filename format
var files = directory.getFiles(fileFilter);

// chunked Array of Files to Insert into Template
var fileChunks = chunkInto(files, 6);

for (var idx = 0; idx < fileChunks.length; idx++){
    // Replace the Smart Objects for All In Template

    // Get Name of Smart Object Layer as String
    var placeHolderName0 = placeHolderName(0)
    var placeHolderName1 = placeHolderName(1)
    var placeHolderName2 = placeHolderName(2)
    var placeHolderName3 = placeHolderName(3)
    var placeHolderName4 = placeHolderName(4)
    var placeHolderName5 = placeHolderName(5)

    // Get the Actual Layer Object
    var placeHolder0 = activeDocument.artLayers.getByName(placeHolderName0)
    var placeHolder1 = activeDocument.artLayers.getByName(placeHolderName1)
    var placeHolder2 = activeDocument.artLayers.getByName(placeHolderName2)
    var placeHolder3 = activeDocument.artLayers.getByName(placeHolderName3)
    var placeHolder4 = activeDocument.artLayers.getByName(placeHolderName4)
    var placeHolder5 = activeDocument.artLayers.getByName(placeHolderName5)

    // Replace the Contents Of Each Smart Object
    // Quick and Dirty Way to Ensure Last Page is Generate
    // Throws an Error on files.pop because empty Array
    var files = fileChunks[idx]
    try {
        replaceContents(files.pop(), placeHolder0)
        replaceContents(files.pop(), placeHolder1)
        replaceContents(files.pop(), placeHolder2)
        replaceContents(files.pop(), placeHolder3)
        replaceContents(files.pop(), placeHolder4)
        replaceContents(files.pop(), placeHolder5)
    }
    catch (e) {
        ;;
    }

    // Save the File
    var outputPath = buildFilename(activeDocument.fullName, "a4-layout"+idx , undefined, 'jpg')
    activeDocument.saveAs(outputPath, jpgOpts, true);
}