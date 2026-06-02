import React, { useState } from "react";
import "./OrderModal.css";

const OrderModal = ({ isOpen, onClose }) => {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    state: "",
    zipcode: "",
    items: [
      { size: "", quantity: 1 }
    ],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleItemChange = (idx, e) => {
    const newItems = form.items.map((item, i) =>
      i === idx ? { ...item, [e.target.name]: e.target.value } : item
    );
    setForm({ ...form, items: newItems });
  };

  const addItem = () => {
    setForm({ ...form, items: [...form.items, { size: "", quantity: 1 }] });
  };

  const removeItem = (idx) => {
    if (form.items.length === 1) return;
    setForm({ ...form, items: form.items.filter((_, i) => i !== idx) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Combine address fields for backend compatibility
      const submitData = {
        ...form,
        address: `${form.address}, ${form.state} ${form.zipcode}`.trim(),
        items: form.items.map(item => ({
          size: item.size,
          quantity: Number(item.quantity)
        }))
      };
      const res = await fetch('http://localhost:5000/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });
      const data = await res.json();
      if (res.ok) {
        alert('Order submitted!');
        onClose();
      } else {
        alert(data.error || 'Order failed.');
      }
    } catch (err) {
      alert('Network error. Please try again.');
    }
    setIsSubmitting(false);
  };

  // Stripe payment link (replace with your own Stripe Payment Link)
  const stripeLink = "https://buy.stripe.com/test_7sI3eQ0wQ0wQ0wQ0wQ";

  return (
    <div className="order-modal-overlay">
      <div className="order-modal">
        <button className="order-modal-close" onClick={onClose}>&times;</button>
        <div className="order-modal-title">Order Now</div>
        <form onSubmit={handleSubmit} className="order-modal-form">
          <label>
            First Name
            <input name="firstName" value={form.firstName} onChange={handleChange} required />
          </label>
          <label>
            Last Name
            <input name="lastName" value={form.lastName} onChange={handleChange} required />
          </label>
          <label>
            Email
            <input name="email" type="email" value={form.email} onChange={handleChange} required />
          </label>
          <label>
            Phone Number
            <input name="phone" value={form.phone} onChange={handleChange} required />
          </label>
          <label>
            Street Address
            <input name="address" value={form.address} onChange={handleChange} required />
          </label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <label style={{ flex: 2 }}>
              State
              <select name="state" value={form.state} onChange={handleChange} required>
                <option value="">Select state</option>
                <option value="AL">Alabama</option>
                <option value="AK">Alaska</option>
                <option value="AZ">Arizona</option>
                <option value="AR">Arkansas</option>
                <option value="CA">California</option>
                <option value="CO">Colorado</option>
                <option value="CT">Connecticut</option>
                <option value="DE">Delaware</option>
                <option value="FL">Florida</option>
                <option value="GA">Georgia</option>
                <option value="HI">Hawaii</option>
                <option value="ID">Idaho</option>
                <option value="IL">Illinois</option>
                <option value="IN">Indiana</option>
                <option value="IA">Iowa</option>
                <option value="KS">Kansas</option>
                <option value="KY">Kentucky</option>
                <option value="LA">Louisiana</option>
                <option value="ME">Maine</option>
                <option value="MD">Maryland</option>
                <option value="MA">Massachusetts</option>
                <option value="MI">Michigan</option>
                <option value="MN">Minnesota</option>
                <option value="MS">Mississippi</option>
                <option value="MO">Missouri</option>
                <option value="MT">Montana</option>
                <option value="NE">Nebraska</option>
                <option value="NV">Nevada</option>
                <option value="NH">New Hampshire</option>
                <option value="NJ">New Jersey</option>
                <option value="NM">New Mexico</option>
                <option value="NY">New York</option>
                <option value="NC">North Carolina</option>
                <option value="ND">North Dakota</option>
                <option value="OH">Ohio</option>
                <option value="OK">Oklahoma</option>
                <option value="OR">Oregon</option>
                <option value="PA">Pennsylvania</option>
                <option value="RI">Rhode Island</option>
                <option value="SC">South Carolina</option>
                <option value="SD">South Dakota</option>
                <option value="TN">Tennessee</option>
                <option value="TX">Texas</option>
                <option value="UT">Utah</option>
                <option value="VT">Vermont</option>
                <option value="VA">Virginia</option>
                <option value="WA">Washington</option>
                <option value="WV">West Virginia</option>
                <option value="WI">Wisconsin</option>
                <option value="WY">Wyoming</option>
              </select>
            </label>
            <label style={{ flex: 1 }}>
              Zip Code
              <input name="zipcode" value={form.zipcode} onChange={handleChange} required />
            </label>
          </div>
          <div>
            <div style={{ fontWeight: 500, marginBottom: '0.3rem' }}>Shirts</div>
            {form.items.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                <select
                  name="size"
                  value={item.size}
                  onChange={e => handleItemChange(idx, e)}
                  required
                  style={{ flex: 2 }}
                >
                  <option value="">Select size</option>
                  <option value="XS">XS</option>
                  <option value="S">S</option>
                  <option value="M">M</option>
                  <option value="L">L</option>
                  <option value="XL">XL</option>
                  <option value="XXL">XXL</option>
                </select>
                <input
                  name="quantity"
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={e => handleItemChange(idx, e)}
                  required
                  style={{ width: '60px', flex: 1 }}
                />
                <button type="button" onClick={() => removeItem(idx)} style={{ fontSize: '1.2rem', color: '#c00', background: 'none', border: 'none', cursor: 'pointer' }} title="Remove">×</button>
              </div>
            ))}
            <button type="button" onClick={addItem} style={{ marginBottom: '0.7rem', background: '#eee', color: '#222', border: '1px solid #bbb', borderRadius: '5px', padding: '0.3rem 0.7rem', cursor: 'pointer', fontWeight: 600 }}>+ Add Shirt</button>
          </div>
          <button type="submit" className="order-modal-submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Order"}
          </button>
        </form>
        <div className="order-modal-or">or</div>
        <a href={stripeLink} target="_blank" rel="noopener noreferrer" className="order-modal-stripe-btn">
          Pay with Card (Stripe)
        </a>
      </div>
    </div>
  );
};

export default OrderModal;
