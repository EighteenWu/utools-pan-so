export default function FeedbackModal({
  open,
  resource,
  form,
  onFormChange,
  onClose,
  onSubmit,
  status,
  msg,
  submitting
}) {
  if (!open || !resource) return null;
  return (
    <div className="feedback-modal-bg">
      <div className="feedback-modal">
        <div className="feedback-modal-header">
          <span>资源失效反馈</span>
          <button className="feedback-modal-close" onClick={onClose}>×</button>
        </div>
        <form className="feedback-form" onSubmit={onSubmit}>
          <div className="feedback-form-group">
            <label>失效类型 <span style={{color:'red'}}>*</span></label>
            <select value={form.invalid_type} onChange={e=>onFormChange({...form,invalid_type:Number(e.target.value)})} required>
              <option value={1}>链接错误</option>
              <option value={2}>资源失效</option>
              <option value={3}>文件不存在</option>
            </select>
          </div>
          <div className="feedback-form-group">
            <label>补充说明</label>
            <textarea value={form.description} onChange={e=>onFormChange({...form,description:e.target.value})} placeholder="请详细描述资源失效的具体情况..." rows={3} />
          </div>
          <div className="feedback-form-group">
            <label>联系方式</label>
            <input type="text" value={form.contact_info} onChange={e=>onFormChange({...form,contact_info:e.target.value})} placeholder="您的邮箱或其他联系方式（选填）" />
          </div>
          {status === 'error' && <div className="feedback-error">{msg}</div>}
          {status === 'success' && <div className="feedback-success">{msg}</div>}
          <div className="feedback-form-actions">
            <button type="button" onClick={onClose} className="feedback-cancel">取消</button>
            <button type="submit" disabled={submitting} className="feedback-submit">{submitting ? '提交中...' : '提交反馈'}</button>
          </div>
        </form>
      </div>
    </div>
  );
} 