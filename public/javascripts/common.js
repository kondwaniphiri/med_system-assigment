function escapeHtml(value) {
  return String(value == null ? '' : value).replace(/[&<>"']/g, function(c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}
$.ajaxSetup({ headers: { 'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').content } });
$(document).ajaxError(function(event, xhr) {
  if (xhr.status === 401 && location.pathname !== '/') { location.href = '/'; return; }
  var body = xhr.responseJSON;
  var message = body && body.message || 'Request failed. Please try again.';
  if (body && body.errors) message += '\n' + body.errors.map(function(e) { return e.msg; }).join('\n');
  alert(message);
});
