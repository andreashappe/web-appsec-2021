"strict mode";

// dynamische
let name = "value";
const konstante = 42;

// kommandostrukturen
if (konstante === 42) {
    // wenn true
} else {
    // wenn false
}

// arrays, maps
let array = [1, 2, 3];
array.push(4);
array.push("4");

let maps = new Map();
maps.set("key", "value");
maps.get("key");

// schleifen über Elemente eines arrays
for (let i of array) {
    console.log("wert: " + i);
    console.log(`wert ${i}`);
}

// funktionen
function name1(par) {
    let a = 3+par;
}

let funktionsvariable = function() {
    return 4+5;
}

funktionsvariable();

console.log("return value:" + name1());

function name2(par) {
    console.log("output: " + par());
}

function output42() {
    return 42;
}

name2(output42);

name2(function() {
    return 3;
});

//(par1, par2) => { par1 + par2 };

name2( () => { return 4} );

class Parent {
    partentMethod() {

    }
}

// Klassen
class Klassenname extends Parent {
    constructor(par1, par2) {
        this.var1 = par1;
        this.var2 = par2;
    }

    outputSomething() {
        return this.var1 + this.var2;
    }
}

const myclass = new Klassenname(1, 2);
myclass.outputSomething();

// nebenläufig in javascript

function networkAccess(url) {
    // access url, dauert 10 sekunden
    return url;
}

function networkAccess(url, success, error) {
    // access url, wird im Hintergrund bearbeitet
    if (url) {
        success(url);
    } else {
        error(-1);
    }
}

networkAccess("url1", function(result) {
    console.log("erfolgreich");
    networkAccess("url2", function(result) {
        console.log("eroflreich");
        networkAccess("url3", function(result) {
            console.log("url");

            // in here
        }, function() {
            // fubar
        });
    }, function(error) {

    });
}, function(error_code) {
    console.log("error");
});

// Promises
function networkAccess("url") {
    return new Promise(function (success, error) {
        
        // longrunning operatoin
        const result = true;
        if (result) {
            success(result);
        } else {
            error(-1);
        }
    });
};

// returniert sofort
let result1 = networkAccess("url1");
result1.then( (result) => networkAccess("url2"))
       .then( (result) => networkAccess("url2"))
       .then( (result) => { console.log("result") })
       .catch((error) =>  console.log("error") );

// Promise
Promise.all(
    [
        networkAccess("url1"),
        networkAccess("url2"),
    ]
)

// async / await

async function function2(url) {
    // langsamer network code
    return 42;
}

let result = await function2("url");