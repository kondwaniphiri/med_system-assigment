$(function() {
  var medicines = [], busy = false;
  function request(action, data) { return $.post('/database/action', Object.assign({ action: action }, data)); }
  function state(item) {
    // ISO date strings compare in calendar order; use the browser's local day.
    var now = new Date();
    var today = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join('-');
    if (item.expiryDate && item.expiryDate < today) return 'expired';
    if (!Number(item.quantity)) return 'out';
    return Number(item.quantity) <= Number(item.minimumStock) ? 'low' : 'available';
  }
  function controls() { $('button').prop('disabled', busy); }
  function render() {
    $('#total').text(medicines.length);
    $('#units').text(medicines.reduce(function(sum, item) { return sum + Number(item.quantity); }, 0));
    $('#low').text(medicines.filter(function(item) { return Number(item.quantity) > 0 && Number(item.quantity) <= Number(item.minimumStock); }).length);
    $('#out').text(medicines.filter(function(item) { return !Number(item.quantity); }).length);
    var query = $('#medicine-search').val().trim().toLowerCase(), filter = $('#stock-filter').val();
    var body = $('#medicine-rows').empty();
    medicines.filter(function(item) {
      return (item.name + ' ' + item.strength).toLowerCase().includes(query) && (filter === 'all' || state(item) === filter);
    }).forEach(function(item) {
      var row = $('<tr>'), status = state(item);
      $('<td>').append($('<strong>').text(item.name), $('<small>').text(item.strength + ' · ' + item.unit)).appendTo(row);
      $('<td>').text(item.quantity).appendTo(row); $('<td>').text(item.minimumStock).appendTo(row);
      $('<td>').text(item.expiryDate || 'Not set').appendTo(row);
      $('<td>').append($('<span class="badge">').addClass(status).text({ available: 'Available', low: 'Low stock', out: 'Out of stock', expired: 'Expired' }[status])).appendTo(row);
      var actions = $('<div class="stock-actions">'), amount = $('<input type="number" min="1" max="1000000" step="1" value="1">').attr('aria-label', 'Quantity for ' + item.name);
      actions.append(amount);
      [['Restock', 1], ['Issue', -1]].forEach(function(option) {
        $('<button type="button">').text(option[0]).toggleClass('issue', option[1] < 0).on('click', function() {
          if (busy || !amount[0].reportValidity()) return;
          var count = Number(amount.val());
          if (!Number.isSafeInteger(count) || count < 1) return;
          if (option[1] < 0 && !confirm('Issue ' + count + ' ' + item.unit.toLowerCase() + ' of ' + item.name + '?')) return;
          busy = true; controls();
          request('pharmacy-adjust', { id: item.medicineId, change: option[1] * count }).done(function(response) { load(response.message); })
            .fail(function() { busy = false; controls(); });
        }).appendTo(actions);
      });
      $('<td>').append(actions).appendTo(row); row.appendTo(body);
    });
    if (!body.children().length) body.append('<tr><td colspan="6">No medicines match. Add a medicine or change your search.</td></tr>');
    controls();
  }
  function load(message) {
    busy = true; controls(); $('#pharmacy-status').text('Loading inventory…');
    request('pharmacy-list').done(function(response) { medicines = response.data; render(); $('#pharmacy-status').text(message || 'Inventory is up to date.'); })
      .fail(function() { $('#pharmacy-status').text('Inventory unavailable. Try Refresh inventory.'); })
      .always(function() { busy = false; controls(); });
  }
  $('#medicine-form').on('submit', function(event) {
    event.preventDefault(); if (busy) return;
    var values = {}; $(this).serializeArray().forEach(function(field) { values[field.name] = field.value; });
    busy = true; controls();
    request('pharmacy-add', values).done(function(response) { $('#medicine-form')[0].reset(); load(response.message); }).fail(function() { busy = false; controls(); });
  });
  $('#medicine-search').on('input', render); $('#stock-filter').on('change', render); $('#refresh').on('click', function() { load(); });
  load();
});
