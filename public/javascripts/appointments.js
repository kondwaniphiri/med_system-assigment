/* Keep the legacy pages and action API; load relationships together to avoid
   displaying partially loaded assignment details. */
var assignmentData = {};
var selectedPatient = null;
var selectedStaff = null;
var assignmentBusy = false;

function patientStaff() {
  var staffMode = $('#staff').prop('checked');
  $('.staffTable').toggle(staffMode);
  $('.patientTable, .patient').toggle(!staffMode);
  $('.doctor').toggle(staffMode && selectedStaff && selectedStaff.position === 'Doctor');
  $('.nurse').toggle(staffMode && selectedStaff && selectedStaff.position === 'Nurse');
}

$(function() {
  var page = { patients: 1, staff: 1 };
  var pageSize = 15;
  var actions = { patients: 'fetchp', staff: 'fetche', wards: 'fetchw', doctors: 'fetchd-p', nurses: 'fetchn-w', admissions: 'fetchp-w' };
  var keys = Object.keys(actions);
  var patientPager = $('<div class="pager">').insertAfter($('.patientTable .section1'));
  var staffPager = $('<div class="pager">').insertAfter($('.staffTable .section1'));

  function request(action, values) { return $.post('/database/action', Object.assign({ action: action }, values)); }
  function load() {
    assignmentBusy = true;
    $('#assignment-status').text('Loading records…');
    $('.rightSide button').prop('disabled', true);
    $.when.apply($, keys.map(function(key) { return request(actions[key]); })).done(function() {
      var results = arguments;
      keys.forEach(function(key, index) { assignmentData[key] = results[index][0].data; });
      selectedPatient = selectedPatient && assignmentData.patients.find(function(p) { return p.patientId === selectedPatient.patientId; });
      selectedStaff = selectedStaff && assignmentData.staff.find(function(s) { return s.staffId === selectedStaff.staffId; });
      renderTable('patients'); renderTable('staff'); renderDetails();
      $('#assignment-status').text('Select a patient or staff member to view assignments.');
    }).fail(function() { $('#assignment-status').text('Could not load assignments. Reload the page to try again.'); })
      .always(function() { assignmentBusy = false; $('.rightSide button').prop('disabled', false); });
  }

  function renderTable(kind) {
    var patients = kind === 'patients';
    var section = patients ? $('.patientTable') : $('.staffTable');
    var query = section.find('input[type=search]').val().trim().toLowerCase();
    var field = section.find('input[type=radio]:checked').val();
    var idKey = patients ? 'patientId' : 'staffId';
    var columns = patients ? [idKey, 'firstName', 'surname', 'insuranceName', 'phone', 'street', 'town', 'province'] : [idKey, 'firstName', 'surname', 'position', 'street', 'town', 'province', 'SSN'];
    var records = (assignmentData[kind] || []).filter(function(record) {
      var value = field === 'name' ? record.firstName + ' ' + record.surname : record[field === 'id' ? idKey : field === 'insurance' ? 'insuranceName' : field];
      return String(value == null ? '' : value).toLowerCase().includes(query);
    });
    var pages = Math.max(1, Math.ceil(records.length / pageSize));
    page[kind] = Math.max(1, Math.min(page[kind], pages));
    var body = section.find('tbody').empty();
    records.slice((page[kind] - 1) * pageSize, page[kind] * pageSize).forEach(function(record) {
      var row = $('<tr tabindex="0" role="button">').attr('aria-label', 'View assignments for ' + record.firstName + ' ' + record.surname);
      columns.forEach(function(column) { $('<td>').text(record[column] == null ? '' : record[column]).appendTo(row); });
      row.on('click keydown', function(event) {
        if (event.type === 'keydown' && event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        if (assignmentBusy) return;
        if (patients) selectedPatient = record; else selectedStaff = record;
        renderDetails();
      }).appendTo(body);
    });
    if (!records.length) $('<tr>').append($('<td colspan="8">').text(query ? 'No matching records.' : 'No records yet.')).appendTo(body);
    var pager = (patients ? patientPager : staffPager).empty();
    $('<button type="button">Previous</button>').prop('disabled', page[kind] <= 1).on('click', function() { page[kind]--; renderTable(kind); }).appendTo(pager);
    $('<span>').text(records.length + ' records · Page ' + page[kind] + ' of ' + pages).appendTo(pager);
    $('<button type="button">Next</button>').prop('disabled', page[kind] >= pages).on('click', function() { page[kind]++; renderTable(kind); }).appendTo(pager);
  }

  function nameOf(records, key, id) {
    var record = records.find(function(item) { return String(item[key]) === String(id); });
    return record ? (record.wardName || record.firstName + ' ' + record.surname) : 'Record #' + id;
  }
  function item(container, label, action, id) {
    var row = $('<div class="assignment-row">').append($('<span>').text(label));
    if (action) $('<button type="button">Remove</button>').attr('aria-label', 'Remove ' + label).on('click', function() {
      if (assignmentBusy || !confirm('Remove this assignment? ' + label)) return;
      assignmentBusy = true;
      $('.rightSide button').prop('disabled', true);
      request(action, { id: id }).done(load).fail(function() { assignmentBusy = false; $('.rightSide button').prop('disabled', false); });
    }).appendTo(row);
    row.appendTo(container);
  }
  function empty(container) { if (!container.children().length) container.text('No assignments.'); }
  function renderDetails() {
    $('.doctors, .nurses, .ward, .patients, .nursePatients, .wards').empty();
    $('.patientId, .staffId, .staffId1').text('—');
    $('.patientName, .staffName, .staffName1').text('Select a record');
    if (selectedPatient) {
      var pid = selectedPatient.patientId;
      $('.patientId').text(pid); $('.patientName').text(selectedPatient.firstName + ' ' + selectedPatient.surname);
      assignmentData.doctors.filter(function(d) { return d.patientId === pid; }).forEach(function(d) {
        item($('.doctors'), 'Dr. ' + nameOf(assignmentData.staff, 'staffId', d.doctorId), 'removed-p', d.id);
      });
      var seenNurses = new Set();
      assignmentData.admissions.filter(function(a) { return a.patientId === pid; }).forEach(function(a) {
        item($('.ward'), 'Ward: ' + nameOf(assignmentData.wards, 'wardId', a.wardId), 'removep-w', a.id);
        assignmentData.nurses.filter(function(n) { return n.wardId === a.wardId; }).forEach(function(n) {
          if (seenNurses.has(n.nurseId)) return;
          seenNurses.add(n.nurseId);
          item($('.nurses'), 'Nurse: ' + nameOf(assignmentData.staff, 'staffId', n.nurseId));
        });
      });
    }
    if (selectedStaff) {
      var sid = selectedStaff.staffId;
      $('.staffId, .staffId1').text(sid); $('.staffName, .staffName1').text(selectedStaff.firstName + ' ' + selectedStaff.surname);
      assignmentData.doctors.filter(function(d) { return d.doctorId === sid; }).forEach(function(d) {
        item($('.patients'), nameOf(assignmentData.patients, 'patientId', d.patientId) + ' · #' + d.patientId, 'removed-p', d.id);
      });
      var seenPatients = new Set();
      assignmentData.nurses.filter(function(n) { return n.nurseId === sid; }).forEach(function(n) {
        item($('.wards'), nameOf(assignmentData.wards, 'wardId', n.wardId), 'removen-w', n.id);
        assignmentData.admissions.filter(function(a) { return a.wardId === n.wardId; }).forEach(function(a) {
          if (seenPatients.has(a.patientId)) return;
          seenPatients.add(a.patientId);
          item($('.nursePatients'), nameOf(assignmentData.patients, 'patientId', a.patientId) + ' · #' + a.patientId);
        });
      });
    }
    $('.doctors, .nurses, .ward, .patients, .nursePatients, .wards').each(function() { empty($(this)); });
    patientStaff();
  }
  $('.patientTable input').on('input change', function() { page.patients = 1; renderTable('patients'); });
  $('.staffTable input').on('input change', function() { page.staff = 1; renderTable('staff'); });
  patientStaff(); load();
});
