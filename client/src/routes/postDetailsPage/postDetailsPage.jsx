import { useEffect, useState } from "react";
import "./postDetailsPage.scss";
import apiRequest from "../../lib/apiRequest";
import { Link, useNavigate } from "react-router-dom";
// import KhaltiCheckout from "khalti-checkout-web"; // Removed: Loaded via script tag

function PostDetailsPage() {
  const [postDetails, setPostDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortOrder, setSortOrder] = useState("highToLow");
  const [cityFilter, setCityFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [availableCities, setAvailableCities] = useState([]);
  const [paymentError, setPaymentError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPostDetails = async () => {
      try {
        setLoading(true);
        const response = await apiRequest.get("/posts/details");
        
        // Log response to see structure
        console.log("Post details response:", response.data);
        
        // Check the first item to understand structure
        if (response.data.length > 0) {
          console.log("First post structure:", response.data[0]);
          console.log("Post ID path:", response.data[0].postId || response.data[0].id);
        }
        
        setPostDetails(response.data);
        
        // Extract unique cities for the filter dropdown
        const cities = [...new Set(response.data.map(detail => detail.post.city))];
        setAvailableCities(cities);
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching post details:", err);
        setError("Failed to load property listings. Please try again later.");
        setLoading(false);
      }
    };

    fetchPostDetails();
  }, []);

  // Function to handle sort order change
  const handleSortChange = (e) => {
    setSortOrder(e.target.value);
  };

  // Function to handle city filter change
  const handleCityFilterChange = (e) => {
    setCityFilter(e.target.value);
  };
  
  // Function to handle status filter change
  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  // Khalti Booking Handler - Using Khalti's JavaScript SDK
  const handleBooking = (detail) => {
    setPaymentError(null);

    if (!detail || !detail.id || !detail.post || !detail.post.price || !detail.post.title) {
        console.error("Booking failed: Missing post details for Khalti configuration.", detail);
        setPaymentError("Cannot initiate booking. Property details are incomplete.");
        return;
    }

    try {
      // Ensure the Khalti global object is available
      if (typeof window.KhaltiCheckout === 'undefined') {
        console.error("Khalti SDK not loaded");
        setPaymentError("Payment system unavailable. Please try again later.");
        alert("Payment system unavailable. Please try again later.");
        return;
      }

      // Configure Khalti
      const config = {
        // Public key from Khalti (merchant)
        "publicKey": "a508c33810214be8a4dae7b30a8b17af",
        
        // Product information
        "productIdentity": detail.id.toString(),
        "productName": detail.post.title,
        "productUrl": `${window.location.origin}/property-details/${detail.id}`,
        
        // Transaction details
        "amount": detail.post.price * 100, // in paisa
        
        // Handler functions
        "eventHandler": {
          onSuccess(payload) {
            // Payment successful - log the payload
            console.log("Payment Success", payload);
            
            // In production, verify the payment with your server here
            
            // For now, just navigate to success page
            alert("Payment successful! Redirecting to success page.");
            navigate('/booking-success');
          },
          onError(error) {
            // Payment failed
            console.log("Payment Error", error);
            setPaymentError("Payment failed: " + error.message);
            alert("Payment failed: " + error.message);
          },
          onClose() {
            // User closed the payment widget
            console.log("Widget closed by user");
          }
        },
        
        // Specify payment methods
        "paymentPreference": [
          "KHALTI",
          "EBANKING",
          "MOBILE_BANKING",
          "CONNECT_IPS",
          "SCT"
        ],
      };

      // Initialize Khalti checkout
      const checkout = new window.KhaltiCheckout(config);
      
      // Display the payment widget
      checkout.show({amount: detail.post.price * 100});
      
    } catch (err) {
      console.error("Error launching Khalti payment widget:", err);
      setPaymentError("Unable to start payment process. Please try again later.");
      alert("Error starting payment process. Please try again.");
    }
  };

  // Get filtered and sorted posts
  const getFilteredAndSortedPosts = () => {
    // Apply city filter if one is selected
    let filtered = [...postDetails];
    
    if (cityFilter) {
      filtered = filtered.filter(detail => detail.post.city === cityFilter);
    }
    
    // Apply status filter if one is selected
    if (statusFilter) {
      filtered = filtered.filter(detail => {
        if (statusFilter === 'available') {
          return detail.post.status !== 'sold' && detail.post.status !== 'occupied';
        } else {
          return detail.post.status === statusFilter;
        }
      });
    }

    // Sort by price
    return filtered.sort((a, b) => {
      if (sortOrder === "highToLow") {
        return b.post.price - a.post.price;
      } else {
        return a.post.price - b.post.price;
      }
    });
  };

  const filteredAndSortedPosts = getFilteredAndSortedPosts();

  if (loading) {
    return <div className="postDetailsPage loading">Loading property listings...</div>;
  }

  if (error) {
    return <div className="postDetailsPage error">{error}</div>;
  }

  return (
    <div className="postDetailsPage">
      <h1>Property Listings</h1>
      
      {paymentError && (
        <div className="paymentErrorPopup">
          <p><strong>Payment Error:</strong> {paymentError}</p>
          <button onClick={() => setPaymentError(null)}>Dismiss</button>
        </div>
      )}

      <div className="statusLegend">
        <div className="legendItem">
          <span className="legendBadge availableBadge"></span>
          <span>Available</span>
        </div>
        <div className="legendItem">
          <span className="legendBadge soldBadge"></span>
          <span>Sold</span>
        </div>
        <div className="legendItem">
          <span className="legendBadge occupiedBadge"></span>
          <span>Occupied</span>
        </div>
      </div>
      
      <div className="filterContainer">
        <div className="filterItem">
          <label htmlFor="sortOrder">Price:</label>
          <select 
            id="sortOrder" 
            value={sortOrder} 
            onChange={handleSortChange}
            className="filterSelect"
          >
            <option value="highToLow">High to Low</option>
            <option value="lowToHigh">Low to High</option>
          </select>
        </div>
        
        <div className="filterItem">
          <label htmlFor="cityFilter">City:</label>
          <select 
            id="cityFilter" 
            value={cityFilter} 
            onChange={handleCityFilterChange}
            className="filterSelect"
          >
            <option value="">All Cities</option>
            {availableCities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>
        
        <div className="filterItem">
          <label htmlFor="statusFilter">Status:</label>
          <select 
            id="statusFilter" 
            value={statusFilter} 
            onChange={handleStatusFilterChange}
            className="filterSelect"
          >
            <option value="">All Statuses</option>
            <option value="available">Available</option>
            <option value="sold">Sold</option>
            <option value="occupied">Occupied</option>
          </select>
        </div>
      </div>
      
      {filteredAndSortedPosts.length === 0 ? (
        <div className="noResults">
          <p>No properties match your current filters. Try adjusting your filters to see more results.</p>
        </div>
      ) : (
        <div className="cardGrid">
          {filteredAndSortedPosts.map((detail) => (
            <div className="propertyCard" key={detail.id}>
              <div className="cardImage">
                {detail.post.images && detail.post.images.length > 0 ? (
                  <img 
                    src={detail.post.images[0]} 
                    alt={detail.post.title} 
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/noimage.jpg";
                    }}
                  />
                ) : (
                  <img src="/noimage.jpg" alt="No image available" />
                )}
                <div className={`statusBadge ${
                  detail.post.status === 'sold' ? 'soldBadge' : 
                  detail.post.status === 'occupied' ? 'occupiedBadge' : 'availableBadge'
                }`}>
                  {detail.post.status === 'sold' ? 'SOLD' : 
                   detail.post.status === 'occupied' ? 'OCCUPIED' : 
                   detail.post.type === 'rent' ? 'FOR RENT' : 'FOR SALE'}
                </div>
              </div>
              <div className="cardContent">
                <h2 className="propertyTitle">
                  {detail.post.title}
                  <span className={`statusBadgeSmall ${
                    detail.post.status === 'sold' ? 'soldBadge' : 
                    detail.post.status === 'occupied' ? 'occupiedBadge' : 'availableBadge'
                  }`}>
                    {detail.post.status === 'sold' ? 'SOLD' : 
                     detail.post.status === 'occupied' ? 'OCCUPIED' : 
                     detail.post.type === 'rent' ? 'RENT' : 'SALE'}
                  </span>
                </h2>
                <div className="propertyPrice">Rs. {detail.post.price}</div>
                <div className="propertyInfo">
                  <div className="location">
                    <img src="/pin.png" alt="location" />
                    <span>{detail.post.address}, {detail.post.city}</span>
                  </div>
                  <p className="propertySummary">
                    {detail.post.property} for {detail.post.type} • 
                    {detail.size ? ` ${detail.size} sqft` : ""}
                  </p>
                </div>
                <div className="cardActions">
                  <Link 
                    to={`/property-details/${detail.id}`} 
                    className="viewDetailsButton actionButton"
                    onClick={(e) => {
                      if (!detail.id) {
                        e.preventDefault();
                        console.error("Post detail ID is undefined, cannot navigate");
                        alert("Unable to view this property. Please try again later.");
                      } else {
                        console.log("Navigating to property details with ID:", detail.id);
                      }
                    }}
                  >
                    View Details
                  </Link>
                  {(detail.post.status !== 'sold' && detail.post.status !== 'occupied') && (
                    <button
                      onClick={() => handleBooking(detail)}
                      className="bookButton actionButton"
                      disabled={loading}
                    >
                      Book Now
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PostDetailsPage;