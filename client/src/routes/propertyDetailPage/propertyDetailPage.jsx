import { useEffect, useState } from "react";
import "./propertyDetailPage.scss";
import apiRequest from "../../lib/apiRequest";
import { Link, useParams } from "react-router-dom";
import DOMPurify from "dompurify";
import Slider from "../../components/slider/Slider";

function PropertyDetailPage() {
  const { id } = useParams();
  const [propertyDetail, setPropertyDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPropertyDetail = async () => {
      try {
        console.log("Fetching property detail with ID:", id);
        setLoading(true);
        const response = await apiRequest.get(`/posts/details/${id}`);
        console.log("Property detail response:", response.data);
        
        // Log the full object structure to help debug
        console.log("Full property detail object:", response.data);
        console.log("postId:", response.data?.postId);
        console.log("id:", response.data?.id);
        
        // Ensure the postId is available directly on the property detail object
        let propertyDetailWithId = response.data;
        if (response.data?.post?.id && !response.data.postId) {
          propertyDetailWithId = {
            ...response.data,
            postId: response.data.post.id
          };
          console.log("Added missing postId to propertyDetail:", propertyDetailWithId.postId);
        }
        
        setPropertyDetail(propertyDetailWithId);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching property detail:", err);
        setError("Failed to load property details. Please try again later.");
        setLoading(false);
      }
    };

    fetchPropertyDetail();
  }, [id]);

  if (loading) {
    return <div className="propertyDetailPage loading">Loading property details...</div>;
  }

  if (error) {
    return <div className="propertyDetailPage error">{error}</div>;
  }

  if (!propertyDetail) {
    return <div className="propertyDetailPage error">Property not found.</div>;
  }

  return (
    <div className="propertyDetailPage">
      <div className="pageHeader">
        <Link to="/postdetails" className="backButton">
          ← Back to Listings
        </Link>
      </div>
      
      <div className="detailCard">
        <div className="cardHeader">
          <h1>{propertyDetail.post.title}</h1>
          <div className="statusAndPrice">
            <div className="price">Rs. {propertyDetail.post.price}</div>
            <div className={`statusBadge ${
              propertyDetail.post.status === 'sold' ? 'soldBadge' : 
              propertyDetail.post.status === 'occupied' ? 'occupiedBadge' : 'availableBadge'
            }`}>
              {propertyDetail.post.status === 'sold' ? 'SOLD' : 
              propertyDetail.post.status === 'occupied' ? 'OCCUPIED' : 
              propertyDetail.post.type === 'rent' ? 'FOR RENT' : 'FOR SALE'}
            </div>
          </div>
        </div>
        
        <div className="cardBody">
          <div className="imageSlider">
            {propertyDetail.post.images && propertyDetail.post.images.length > 0 ? (
              <Slider images={propertyDetail.post.images} />
            ) : (
              <img src="/noimage.jpg" alt="No image available" className="noImage" />
            )}
          </div>
          
          <div className="mainInfo">
            <div className="location">
              <img src="/pin.png" alt="location" />
              <span>{propertyDetail.post.address}, {propertyDetail.post.city}</span>
            </div>
            
            <div className="propertyTypesWrapper">
              <div className="propertyType">
                <span className="label">Property Type:</span>
                <span className="value">{propertyDetail.post.property}</span>
              </div>
              <div className="propertyType">
                <span className="label">Transaction Type:</span>
                <span className="value">{propertyDetail.post.type}</span>
              </div>
            </div>
            
            <div className="detailsGrid">
              {propertyDetail.size && (
                <div className="detailItem">
                  <span className="label">Size:</span>
                  <span className="value">{propertyDetail.size} sqft</span>
                </div>
              )}
              {propertyDetail.utilities && (
                <div className="detailItem">
                  <span className="label">Utilities:</span>
                  <span className="value">{propertyDetail.utilities}</span>
                </div>
              )}
              {propertyDetail.pet && (
                <div className="detailItem">
                  <span className="label">Pet Policy:</span>
                  <span className="value">{propertyDetail.pet}</span>
                </div>
              )}
              {propertyDetail.income && (
                <div className="detailItem">
                  <span className="label">Income Requirement:</span>
                  <span className="value">{propertyDetail.income}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="proximityInfo">
            <h2>Nearby Amenities</h2>
            <div className="proximityGrid">
              {propertyDetail.school !== null && (
                <div className="proximityItem">
                  <img src="/school.png" alt="School" />
                  <span>School: {propertyDetail.school}m away</span>
                </div>
              )}
              {propertyDetail.bus !== null && (
                <div className="proximityItem">
                  <img src="/bus.png" alt="Bus" />
                  <span>Bus Stop: {propertyDetail.bus}m away</span>
                </div>
              )}
              {propertyDetail.restaurant !== null && (
                <div className="proximityItem">
                  <img src="/food.png" alt="Restaurant" />
                  <span>Restaurant: {propertyDetail.restaurant}m away</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="description">
            <h2>Description</h2>
            <div 
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(propertyDetail.desc || "No description available")
              }}
            />
          </div>
        </div>
        
        <div className="cardFooter">
          <div className="ownerInfo">
            <img 
              src={propertyDetail.post.user?.avatar || "/noavatar.jpg"} 
              alt="Owner" 
              className="ownerAvatar"
            />
            <span>Posted by: {propertyDetail.post.user?.username || "Unknown Owner"}</span>
          </div>
          <Link 
            to={propertyDetail.post && propertyDetail.post.id ? `/${propertyDetail.post.id}` : 
               propertyDetail.postId ? `/${propertyDetail.postId}` : `/`} 
            className="viewPropertyButton"
            onClick={(e) => {
              const postId = propertyDetail.post?.id || propertyDetail.postId;
              if (!postId) {
                e.preventDefault();
                console.error("Post ID is undefined in property detail page");
                alert("Unable to view full property page. Please try again later.");
              } else {
                console.log("Navigating to full property page with ID:", postId);
              }
            }}
          >
            View Full Property Page
          </Link>
        </div>
      </div>
    </div>
  );
}

export default PropertyDetailPage;