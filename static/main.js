import Crypto from "./modules/crypto.js";

window.Crypto = Crypto;

//Preconfig

let ACCESS_KEY = '';

//************
let lock;

let graphicLockDynamicCallback = function () {
}

function initGraphicLocker() {
    lock = new PatternLock("#lock", {
        onPattern: function (pattern) {
            if (graphicLockDynamicCallback) {
                graphicLockDynamicCallback(pattern);
            }
        }
    });
}

function getGraphicKey() {
    return new Promise((resolve, reject) => {
        graphicLockDynamicCallback = function (pattern) {
            if (pattern) {
                graphicLockDynamicCallback = function () {
                }
                lock.clear();
                resolve(pattern);
            } else {
                graphicLockDynamicCallback = function () {
                }
                lock.clear();
                reject("Pattern is empty");
            }
        }
    });
}

async function getEnhancedGraphicKey(message = 'Enter graphic key') {
    $('graphicKeyInputMessage').text(message);
    $("#graphicKeyInput").fadeIn(200);
    let key = await getGraphicKey();

    //Enhance key by  hashing access key + graphic key

    $("#graphicKeyInput").fadeOut(200);
    return await Crypto.makeEnhancedKey(key, ACCESS_KEY);
}

window.getEnhancedGraphicKey = getEnhancedGraphicKey;


async function getSpaces() {
    let response = await fetch("/spaces", {
        method: "GET",
        headers: {
            "x-api-key": ACCESS_KEY,
        }
    });

    if (response.status !== 200) {
        throw new Error("Error fetching spaces");
    }

    let data = await response.json();
    return data;
}

async function renderSpaces() {
    let spaces = await getSpaces();

    let spacesDiv = $("#spacesList");
    spacesDiv.empty();

    for (let space of spaces) {
        spacesDiv.append(`
        <div class="spaceItem" onclick="loadSpace('${space}')">
            <h2>${space}</h2>
        </div>
        `);
    }

    spacesDiv.append(`<div class="spaceItem">
            <h2>Create new space ➕</h2>
        </div>`);
}

async function getSpaceContent(spaceId) {
    let response = await fetch(`/spaceContent/${spaceId}`, {
        method: "GET",
        headers: {
            "x-api-key": ACCESS_KEY,
        }
    });

    if (response.status !== 200) {
        throw new Error("Error fetching space content");
    }

    let data = await response.json();
    return data;
}

async function loadSpace(spaceId) {
    let space = await getSpaceContent(spaceId);

    //TODO: check spaceKeyHash
    let key = await getEnhancedGraphicKey('Enter key for space: ' + spaceId);

    let keyHash = await Crypto.hash(key);

    console.log("Key hash: ", keyHash);

    if (keyHash !== space.spaceKeyHash) {
        alert("Key is invalid");
        return;
    }

    let content = space.content;

    $('#spacesPage').fadeOut(200);
    $('#spaceContentPage').fadeIn(200);

    let contentDiv = $("#contentList");
    contentDiv.empty();


    for (let item of content) {

        let type = item.type;

        switch (type) {
            case "password":
                type = "🔒";
                break;
            case "key":
                type = "🔑";
                break;
            case "text":
                type = "📝";
                break;
            default:
                type = "❓";
        }

        contentDiv.append(`
        <div class="contentItem" onclick="unlockAndShowContent('${item.name}', '${item.encryptedValue}', '${item.type}')">
            <h2>${type} ${item.name}</h2>
            <p></p>
        </div>
        `);
    }

    contentDiv.append(`
        <div class="contentItem">
            <h2>Add protected item ➕</h2>
        </div>
    `);
}

window.loadSpace = loadSpace;

async function unlockAndShowContent(name, encryptedContent, type ) {
    let key = await getEnhancedGraphicKey('Enter key for content: ' + name);
    try{
        let content = await Crypto.decrypt(encryptedContent, key);

       // console.log("Decrypted content: ", content);

        await viewDecryptedContent(name, content, type);

    }catch (e) {
        alert("Key is invalid");
        return;
    }

}
window.unlockAndShowContent = unlockAndShowContent;

window.timeout = 13;

async function viewDecryptedContent(name, content, type) {
    $('#viewDecryptedContent').fadeIn(200);
    $('#decryptedContentName').text(name);
    $('#decryptedContentText').val(content);

    window.timeout = 13;

  let interval =   setInterval(function () {
      window.timeout--;
        $('#decryptedContentTimeout').text(window.timeout);
        if (window.timeout <= 0) {
            $('#viewDecryptedContent').fadeOut(200);
            $('#decryptedContentText').val("");
            clearInterval(interval);
            return;
        }
    }, 1000);
}

async function init() {
    initGraphicLocker();

    ACCESS_KEY = localStorage.getItem('access_key') || '';

    if (!ACCESS_KEY) {
        ACCESS_KEY = prompt("Please enter your access key");
        if (!ACCESS_KEY) {
            alert("Access key is required");
            window.location.reload();
            return;
        }

        localStorage.setItem('access_key', ACCESS_KEY);
    }

    //Check if access key is valid
    try {
        await getSpaces();
    } catch (e) {
        alert("Access key is invalid");
        localStorage.removeItem('access_key');
        window.location.reload();
        return;
    }


    $("#graphicKeyInput").fadeOut(0);

    await renderSpaces();

    $('#decryptedContentText').click(function () {
        let input = $(this);
        input.select();
        //Copy to clipboard
        navigator.clipboard.writeText(input.val()).then(function () {
            input.css('background-color', '#4CAF50');
            setTimeout(function () {
                input.css('background-color', '');
            }, 500);
        }, function (err) {
            console.error('Could not copy text: ', err);
        });
    });

}

init();
