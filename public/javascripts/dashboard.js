$(function() {
  var loading = false;
  function refresh() {
    if (loading) return;
    loading = true;
    $('#refresh-dashboard').prop('disabled', true);
    $('#dashboard-status').text('Loading hospital overview…');
    $.post('/database/action', { action: 'dashboard' }).done(function(response) {
      var totals = response.data.totals;
      $('[data-total]').each(function() { $(this).text(totals[this.dataset.total] || 0); });
      var body = $('#ward-summary').empty();
      response.data.wards.forEach(function(ward) {
        var occupied = Number(ward.occupancy);
        var capacity = ward.capacity == null ? null : Number(ward.capacity);
        var row = $('<tr>');
        [ward.wardName, occupied, capacity == null ? 'Unspecified' : capacity,
          capacity == null ? 'Unspecified' : Math.max(0, capacity - occupied),
          capacity == null ? 'No capacity set' : occupied >= capacity ? 'Full' : 'Available'
        ].forEach(function(value) { $('<td>').text(value).appendTo(row); });
        row.appendTo(body);
      });
      if (!response.data.wards.length) body.append('<tr><td colspan="5">No wards configured.</td></tr>');
      $('#dashboard-status').text('Updated ' + new Date().toLocaleTimeString());
    }).fail(function() { $('#dashboard-status').text('Overview unavailable. Use Refresh to try again.'); })
      .always(function() { loading = false; $('#refresh-dashboard').prop('disabled', false); });
  }
  $('#refresh-dashboard').on('click', refresh);
  refresh();
  $('#password-form').on('submit', function(event) {
    event.preventDefault();
    if ($('#new-password').val() !== $('#confirm-password').val()) {
      $('#password-status').text('New passwords do not match.'); return;
    }
    var button = $(this).find('button[type=submit]').prop('disabled', true);
    $.post('/database/action', {
      action: 'change-password', currentPassword: $('#current-password').val(), newPassword: $('#new-password').val()
    }).done(function(response) { alert(response.message); location.href = '/'; })
      .always(function() { button.prop('disabled', false); });
  });
});
