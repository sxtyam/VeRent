var deleteVehicleHandler = function (vehicleId) {
  var deleteUrl = "/delete/" + vehicleId;
  $.post(deleteUrl, function (data, status) {
    location.reload();
  });
}

function formChangeHandler() {
  if (document.getElementById("bicycle").checked) {
    document.getElementById("plateNumberDiv").style.display = "none";
    document.getElementById("travelledDiv").style.display = "none";
  } else {
    document.getElementById("plateNumberDiv").style.display = "block";
    document.getElementById("travelledDiv").style.display = "block";
  }
}

var inputFile = document.getElementById('customFile');
inputFile.addEventListener('change', (e) => {
  document.getElementById('file-input-label').innerText = inputFile.files[0].name;
})