function focusNext(event, next, previous) {
  var target = event.key === 'ArrowDown' || event.key === 'Enter' ? next : event.key === 'ArrowUp' ? previous : null;
  if (target) { event.preventDefault(); document.getElementById(target).focus(); }
}

function setupRecordForm(staff) {
  var fields = staff ? ['firstName', 'surname', 'position', 'street', 'town', 'province', 'SSN'] : ['firstName', 'surname', 'insurance', 'phone', 'street', 'town', 'province'];
  var idKey = staff ? 'staffId' : 'patientId';
  var suffix = staff ? 'e' : 'p';
  var records = [], busy = false, ready = false;
  var status = $('<p class="record-status" role="status" aria-live="polite">').appendTo('.input');
  var buttons = $('.buttons button');
  var updateButton = buttons.filter('[onclick^="update"]');
  var deleteButton = buttons.filter('[onclick^="delete"]');
  function selected() { return records.find(function(record) { return String(record[idKey]) === $('#searchId').val().trim(); }); }
  function controls() {
    var editing = $('#enable').prop('checked');
    $('#searchId, #h1Id').toggle(editing);
    buttons.prop('disabled', busy || !ready);
    updateButton.add(deleteButton).prop('disabled', busy || !ready || !editing || !selected());
    $('#addSubmit').prop('disabled', busy || !ready || editing);
  }
  function clear() { fields.forEach(function(field) { $('#' + field).val(''); }); $('#searchId').val(''); controls(); }
  function load() {
    ready = false; controls(); status.text('Loading records…');
    return $.post('/database/action', { action: 'fetch' + suffix }).done(function(response) {
      records = response.data; ready = true;
      status.text('Ready. Enable Update & Delete to find an existing record by its full ID.');
    }).fail(function() { status.text('Unable to load records. Reload the page to retry.'); }).always(controls);
  }
  function save(operation) {
    if (busy || !ready) return;
    var editing = $('#enable').prop('checked');
    if ((operation === 'add' && editing) || (operation !== 'add' && (!editing || !selected()))) {
      status.text('Choose a valid record ID in edit mode first.'); return;
    }
    if (operation !== 'delete') {
      for (var i = 0; i < fields.length; i++) if (!document.getElementById(fields[i]).reportValidity()) return;
    }
    if (operation === 'delete' && !confirm('Delete this record and its related assignments? This cannot be undone.')) return;
    var payload = { action: operation + suffix };
    if (operation !== 'add') payload.id = $('#searchId').val().trim();
    if (operation !== 'delete') fields.forEach(function(field) { payload[field === 'firstName' && staff ? 'firstname' : field] = $('#' + field).val().trim(); });
    busy = true; controls(); status.text('Saving…');
    $.post('/database/action', payload).done(function(response) {
      clear();
      load().done(function() { status.text(response.message); });
    }).fail(function() { status.text('No changes saved. Correct the error and try again.'); })
      .always(function() { busy = false; controls(); });
  }
  $('#enable').on('change', function() { clear(); status.text(this.checked ? 'Enter the full record ID to edit or delete.' : 'Add a new record.'); });
  $('#searchId').on('input', function() {
    var record = selected();
    fields.forEach(function(field) { var key = field === 'insurance' ? 'insuranceName' : field; $('#' + field).val(record && record[key] != null ? record[key] : ''); });
    status.text(record ? 'Editing ' + record.firstName + ' ' + record.surname : 'No matching record. Enter the full ID.');
    controls();
  });
  $('.clear').on('click', function() { clear(); status.text('Form cleared.'); });
  window[staff ? 'addEmployee' : 'addPatient'] = function() { save('add'); };
  window[staff ? 'updateStaff' : 'updatePatient'] = function() { save('update'); };
  window[staff ? 'deleteStaff' : 'deletePatient'] = function() { save('delete'); };
  load();
}
