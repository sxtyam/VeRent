var deleteVehicleHandler = function (vehicleId) {
  var deleteUrl = "/delete/" + vehicleId;
  $.post(deleteUrl, function (data, status) {
    location.reload();
  });
}