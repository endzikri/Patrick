var pocetakIgre = false;
var krajIgre = false;
var dugme = Array(6).fill(false);
var skeleton;
var brojPolja = 6;
var boje = ["slike/red.png", "slike/yellow.png", "slike/black.png"];
var resenje = [Math.floor(Math.random() * 6), Math.floor(Math.random() * 6), Math.floor(Math.random() * 6), Math.floor(Math.random() * 6)]
var prikazanRezultat = Array(brojPolja).fill(false);
var matrica;


var playerToNumber = {
    "slike/gari.jpg" : 0,
    "slike/keba_kraba.jpg" : 1,
    "slike/lignjoslav.jpg" : 2,
    "slike/patrik.png" : 3,
    "slike/sandy.png" : 4,
    "slike/sundjerbob.jpg" : 5
};

function drawTable() {

    var table = document.createElement("div");
    table.setAttribute("class", "div-table");
    for (i = 0; i < brojPolja; i++) {
        var row = document.createElement("div");
        row.setAttribute("class", "div-table-row");
        row.setAttribute("id", "row" + i);
        var row_content = "";

        for (j = 0; j < 4; j++)  {
            row_content = row_content + ("<div id = x" + String(i*4 + j)  + " class = div-table-col>" + "</div>");
        }
        row.innerHTML = row_content;
        table.appendChild(row);
    }
    document.body.appendChild(table);
}

function drawResult(index = -1) {

    skeleton = document.createElement("div");
    skeleton.setAttribute("id", "res");
    document.body.appendChild(skeleton);
}

function findFirstFalse(matrica) {
    for (let i = 0; i < matrica.length; i++) {
        for (let j = 0; j < matrica[i].length; j++) {
            if (!matrica[i][j])
                return [i, j];
        }
    }

    return [-1, -1];
}


function previousRowConfirmed(row_indicator, confirmedRows) {
    
    if (row_indicator == 0)
        return true;
    else
        return confirmedRows[row_indicator-1];
}




function solveRedYellow(tmp_result) {
    var red_fields = 0;
    var yellow_fields = 0;
    for (let i = 0; i < 4; i++) {
        red_fields = tmp_result[i] === resenje[i] ? red_fields+1 : red_fields;
    }

    solution_bucket = Array(brojPolja).fill(0);
    result_bucket = Array(brojPolja).fill(0);
    for (let i = 0; i < 4; i++) {
        solution_bucket[resenje[i]]++;
        result_bucket[tmp_result[i]]++;
    }
    for (let i = 0; i < brojPolja; i++) {
        if (solution_bucket[i] > 0 && result_bucket[i] > 0)
            yellow_fields += Math.min(solution_bucket[i], result_bucket[i]);
    }

    return [red_fields, yellow_fields - red_fields];
}


function showResult(boje, index) {

    if (prikazanRezultat[index])
        return;
    row = document.createElement("div");
    row.setAttribute("class", "color-row");
    
    for (let i = 0; i < boje.length; i++) {
        var field = document.createElement("div");
        field.setAttribute("class", "color-field");
        row.appendChild(field);
        var image = document.createElement("img");
        image.setAttribute("src", boje[i].getAttribute("src"));
        image.setAttribute("class", "boje");
        field.appendChild(image);
    }
    skeleton.appendChild(row);
}

function generateColors(result, index) {
    var colPic = [];
    for (let i = 0; i < result[0]; i++) {
        var element = document.createElement("img");
        element.setAttribute("src", boje[0]);
        colPic.push(element)
    }

    for (let i = 0; i < result[1]; i++) {
        var element = document.createElement("img");
        element.setAttribute("src", boje[1]);
        colPic.push(element);
    }


    for (let i = 0; i < 4 - result[0] - result[1]; i++) {
        var element = document.createElement("img");
        element.setAttribute("src", boje[2]);
        colPic.push(element);
    }

    showResult(colPic, index);
    colPic.forEach((e) => {
        e.setAttribute("class", "boje");
    });

}

async function checkResult(index) {
    var row = document.querySelector("#row" + index);
    var input = [];
    var divs = row.childNodes;
    for (const div of divs) {
        if (div.nodeName !== "BUTTON") {
            for (let pic of div.childNodes) {
                input.push(playerToNumber[pic.getAttribute("src")]);
            }
        }
    }
    
    var result = solveRedYellow(input);
    generateColors(result, index);
    prikazanRezultat[index] = true;
    if (JSON.stringify(result) == JSON.stringify([4, 0])) {
        var time = document.getElementById("bar").getAttribute("style").match(/\d+/)[0];
        var resenje = findFirstFalse(matrica);
        var result = (resenje[0] - 1) / -5 * 50 + 60 + time / 2;
        let res = await axios.post('/addPlayer', {result: result});
        console.log(res);
        window.alert("BRAVO!!! TVOJ REZULTAT JE: " + result);
        krajIgre = true;
        sendResult(result);
    }
}

function confirmRow(confirmedRows, index) {
    if (!not_filled_row(index, matrica)) {
        id = parseInt(this.getAttribute("id"));
        confirmedRows[index] = true;

        checkResult(index);
    }    
}

function generateButton(index, confirmedRows) {
    if (dugme[index])
        return;
    var button = document.createElement("button");
    button.setAttribute("id", String(index));
    button.innerHTML = "POTVRDI";
    button.addEventListener("click", confirmRow.bind(button, confirmedRows, index));
    dugme[index] = true;
    document.getElementById("row" + index).appendChild(button);
}
function setUndo(matrica, confirmedRows) { 
    undoButton = document.createElement("button");
    undoButton.innerHTML = "UNDO";
    undoButton.setAttribute("id", "undoBtn");
    undoButton.addEventListener("click", function () {
        var empty = findFirstFalse(matrica);
        console.log(empty);
        if (empty[1] === 0 && empty[0] > 0 && confirmedRows[empty[0]-1])
            return;
        if (empty[0] === 0 && empty[1] === 0)
            return;

        if (empty[1] === 0) {
            empty[0]--;
            empty[1] = 3;
        } else if (JSON.stringify(empty) == JSON.stringify([-1, -1])) {
            empty = [5, 3];
        }
        else empty[1]--;
        var idToDelete = 4 * empty[0] + empty[1];
        matrica[empty[0]][empty[1]] = false;
        var fieldToDelete = document.getElementById("x" + idToDelete);
        fieldToDelete.removeChild(fieldToDelete.firstElementChild);
    });

    document.getElementById("slike").appendChild(undoButton);
}

function not_filled_row(i, matrica) {
    return matrica[i].some(elem => {return elem == false});
}

function initListener(matrica) {
    var confirmedRows = Array(brojPolja).fill(false);
    var finishedRows = Array(brojPolja).fill(false);
    var pics = document.getElementsByTagName("img");
    for (var index = 0; index < pics.length; index++)
           pics[index].addEventListener("click", function () {
               if (krajIgre)
                   return;
               if (!pocetakIgre)
                   return;
               var player = this.getAttribute("src");
               var emptyFields = findFirstFalse(matrica);
               if (previousRowConfirmed(emptyFields[0], confirmedRows)) {
                   matrica[emptyFields[0]][emptyFields[1]] = true;
                   if (emptyFields[1] == 3) {
                       finishedRows[emptyFields[0]] = true;
                       generateButton(emptyFields[0], confirmedRows);
                   }
                   var query = "#x" + String(emptyFields[0] * 4 + emptyFields[1]);
                   var image = document.createElement("img");
                   image.setAttribute("src", player);
                   document.querySelector(query).appendChild(image);
                }
           },
        false)


    setStart();    
    setUndo(matrica, confirmedRows);
}

function setStart() {
    var startButton = document.createElement("button");
    startButton.setAttribute("id", "startButton");
    startButton.innerHTML = "START";
    document.body.appendChild(startButton);
    startButton.onclick = function() {
        pocetakIgre = true;
    }
}

function makeProgressBar() {
    var myProgress = document.createElement("div");
    var myBar = document.createElement("div");
    myProgress.setAttribute("id", "progress");
    myBar.setAttribute("id", "bar");
    document.body.appendChild(myProgress);
    myProgress.appendChild(myBar);
    
    (function(){
        var width = 0;
        var interval = setInterval(function() {
            if (width >= 100) {
                clearInterval(interval);
                krajIgre = true; 
                window.alert("NA ZALOST NISTE POGODILI KOMBINACIJU.")          
            } else if (!krajIgre && pocetakIgre){
                myBar.style.width = width++ + "%";
            }
        }, 500)
    })();
}


function play() {
    matrica = Array(brojPolja);
    for (let i = 0; i < matrica.length; i++)
        matrica[i] = Array(4).fill(false);

    makeProgressBar();
    initListener(matrica);
}

function sendResult(result) {
    
}

drawTable();
drawResult();
play();