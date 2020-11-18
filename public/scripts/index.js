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