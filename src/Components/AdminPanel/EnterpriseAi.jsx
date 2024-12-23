import React, { useState, useEffect, useMemo } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import Compressor from "../User/Assets/compressor-img.png";
import axios from "axios";
import Swal from 'sweetalert2';
import baseurl from '../ApiService/ApiService';
import { Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Card, Form, Row, Col } from 'react-bootstrap';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const EnterpriseAi = () => {
  const user = JSON.parse(localStorage.getItem('userData'));
  const [stats, setStats] = useState({
    totalUsersTechnician: 0,
    totalOrders: 0,
    totalUsersDistributor: 0,
    totalSales: 0,
  });
  const [orderSummary, setOrderSummary] = useState({
    received: 0,
    shipping: 0,
    complaint: 0,
    canceled: 0,
    done: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [userRes, orderRes] = await Promise.all([
          axios.get(`${baseurl}/api/allUsers`),
          axios.get(`${baseurl}/api/orders`),
        ]);

        // Ensure data is available and valid
        const usersData = userRes.data?.data || [];
        const ordersData = orderRes.data?.data || [];
        setUsers(usersData);

        // Calculate order summary
        const summary = {
          received: ordersData.filter(order => order.status === 'Received').length,
          shipping: ordersData.filter(order => order.status === 'Shipping').length,
          complaint: ordersData.filter(order => order.status === 'Complaint').length,
          canceled: ordersData.filter(order => order.status === 'Cancelled').length,
          done: ordersData.filter(order => order.status === 'Done').length
        };
        setOrderSummary(summary);

        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        // Ensure total sales calculation handles potential null/undefined values
        const totalSalesForWeek = ordersData
          .filter(order => {
            const orderDate = new Date(order.createdAt); // Adjust the field name if different
            return (
              order.status === 'Done' &&
              orderDate >= oneWeekAgo &&
              orderDate <= new Date()
            );
          })
          .reduce((total, order) => {
            const amount = parseFloat(order.total_amount || 0); // Adjust field name if different
            return total + (isNaN(amount) ? 0 : amount);
          }, 0);

        const technicians = usersData.filter(user => user.role === 'technician');
        const distributors = usersData.filter(user => user.role === 'distributor');
        // Update stats with safe fallback values

        const previousWeekOrders = ordersData.filter(order => {
          const orderDate = new Date(order.createdAt);
          return orderDate >= oneWeekAgo && orderDate <= new Date();
        });

        setStats({
          totalUsers: technicians.length || 0,
          totalOrders: previousWeekOrders.length || 0,
          totalUsersDistributor: distributors.length || 0,
          totalSales: totalSalesForWeek
        });

        // Set orders state
        setOrders(ordersData);
      } catch (error) {
        console.error('Error fetching stats:', error);

        // Set fallback values in case of error
        setStats({
          totalUsers: 0,
          totalOrders: 0,
          totalUsersDistributor: 0,
          totalSales: 0
        });

        setOrderSummary({
          received: 0,
          shipping: 0,
          complaint: 0,
          canceled: 0,
          done: 0
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);
  const technicians = users.filter(user => user.role === 'technician');
  const distributors = users.filter(user => user.role === 'distributor');

  const SalesPieChart = ({ orders }) => {
    // State to track the current time period view
    const [timePeriod, setTimePeriod] = useState('month');

    // Function to group sales by product for different time periods
    const getSalesData = useMemo(() => {
      // Filter completed orders (you might want to adjust this based on your business logic)
      const completedOrders = orders.filter(order => order.status === 'Done');

      // Group sales by product
      const productSales = completedOrders.reduce((acc, order) => {
        // Aggregate sales by product
        order.OrderItems.forEach(item => {
          const productId = item.product_id;
          const productName = item.Product.product_id;

          if (!acc[productId]) {
            acc[productId] = {
              total: 0,
              name: productName
            };
          }
          acc[productId].total += item.price * item.quantity;
        });

        return acc;
      }, {});

      // Convert to array and sort to get top 3 products
      const sortedProducts = Object.entries(productSales)
        .sort((a, b) => b[1].total - a[1].total)
        .slice(0, 3);

      // Prepare chart data for top 3 products
      const chartData = {
        labels: sortedProducts.map(([, product]) => product.name),
        datasets: [{
          data: sortedProducts.map(([, product]) => product.total),
          backgroundColor: ['#D8E6FF', '#6A9DFF', '#F24E1E'],
          hoverOffset: 4,
        }]
      };

      // Calculate total sales of top 3 products
      const totalSales = sortedProducts.reduce((total, [, product]) => total + product.total, 0);

      // Calculate processed percentage (you might need to adjust this logic)
      const processedPercentage = completedOrders.length > 0
        ? Math.round((totalSales /
          completedOrders.reduce((total, order) =>
            total + order.OrderItems.reduce((sum, item) => sum + item.price * item.quantity, 0), 0)
        ) * 100)
        : 0;

      return {
        chartData,
        totalSales,
        processedPercentage
      };
    }, [orders, timePeriod]);

    // Chart options
    const options = {
      responsive: true,
      plugins: {
        legend: {
          position: 'right',
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const value = context.raw;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = ((value / total) * 100).toFixed(2);
              return `${context.label}: ₹${value.toLocaleString()} (${percentage}%)`;
            },
          },
        },
      },
    };
    return (
      <Card className="h-100">
        <Card.Body>
          <Row className="align-items-center mb-3">
            <Col>
              <Card.Title className="mb-0">Top 3 Product Sales</Card.Title>
            </Col>
            <Col xs="auto">
              <Form.Select
                value={timePeriod}
                onChange={(e) => setTimePeriod(e.target.value)}
                className="w-auto"
              >
                <option value="week">Week</option>
                <option value="month">Month</option>
                <option value="year">Year</option>
              </Form.Select>
            </Col>
          </Row>

          <div className="d-flex align-items-center justify-content-center mb-3">
            <h3 className="mb-0 me-2">
              <i className="bi bi-currency-rupee"></i>
              {getSalesData.totalSales.toLocaleString()}
            </h3>
          </div>

          <div className="">
            <Pie
              data={getSalesData.chartData}
              options={options}
            />

          </div>
          <div className='d-flex justify-content-center'>
            <p className="mb-0 p-2"
              style={{
                backgroundColor: 'blue',
                color: 'white', width: 'max-content'
              }}
            >
              {getSalesData.processedPercentage}%
              Processed
            </p>
          </div>
        </Card.Body>
      </Card>
    );
  };

  const SalesComparisonCard = ({ ordersData }) => {
    const [timePeriod, setTimePeriod] = useState('week');
    const [salesData, setSalesData] = useState({
      totalSales: 0,
      chartData: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
          {
            label: 'This Week',
            data: Array(7).fill(0),
            backgroundColor: '#4CAF50',
            borderColor: '#4CAF50',
            borderWidth: 1,
          },
          {
            label: 'Last Week',
            data: Array(7).fill(0),
            backgroundColor: '#FF9800',
            borderColor: '#FF9800',
            borderWidth: 1,
          },
        ],
      },
      processedPercentage: 0,
    });

    useEffect(() => {
      const calculateSalesForDays = (orders, startDate, endDate) => {
        const sales = Array(7).fill(0); // Array to store sales for each day (Mon-Sun)

        orders.forEach(order => {
          const orderDate = new Date(order.completeAt);
          if (orderDate >= startDate && orderDate <= endDate) {
            const dayOfWeek = orderDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
            sales[dayOfWeek] += parseFloat(order.total_amount || 0);
          }
        });

        return sales;
      };

      const today = new Date();
      const startOfThisWeek = new Date(today.setDate(today.getDate() - today.getDay())); // Sunday of this week
      const endOfThisWeek = new Date(startOfThisWeek);
      endOfThisWeek.setDate(startOfThisWeek.getDate() + 6); // Saturday of this week

      const startOfLastWeek = new Date(startOfThisWeek);
      startOfLastWeek.setDate(startOfThisWeek.getDate() - 7); // Sunday of last week
      const endOfLastWeek = new Date(startOfLastWeek);
      endOfLastWeek.setDate(startOfLastWeek.getDate() + 6); // Saturday of last week

      const thisWeekSales = calculateSalesForDays(ordersData, startOfThisWeek, endOfThisWeek);
      const lastWeekSales = calculateSalesForDays(ordersData, startOfLastWeek, endOfLastWeek);

      // Calculate total sales for both weeks
      const totalThisWeek = thisWeekSales.reduce((sum, sale) => sum + sale, 0);
      const totalLastWeek = lastWeekSales.reduce((sum, sale) => sum + sale, 0);

      setSalesData({
        totalSales: totalThisWeek + totalLastWeek,
        chartData: {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          datasets: [
            {
              label: 'This Week',
              data: thisWeekSales,
              backgroundColor: 'blue',
              borderColor: 'blue',
              borderWidth: 1,
            },
            {
              label: 'Last Week',
              data: lastWeekSales,
              backgroundColor: 'red',
              borderColor: 'red',
              borderWidth: 1,
            },
          ],
        },
        processedPercentage: ((totalThisWeek / (totalThisWeek + totalLastWeek)) * 100).toFixed(2),
      });
    }, [ordersData]);

    // Bar chart options
    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: 'Sales Comparison (This Week vs Last Week)',
        },
      },
    };

    return (
      <Card className="h-100">
        <Card.Body className="d-flex flex-column justify-content-between">
          <Row className="align-items-center mb-3">
            <Col xs="12">
              <Card.Title className="mb-0 text-center text-md-start">
                Sales Comparison
              </Card.Title>
            </Col>
          </Row>

          <div className="d-flex align-items-center justify-content-center mb-3">
            <h3 className="mb-0 me-2 text-center">
              <i className="bi bi-currency-rupee"></i>
              {salesData.totalSales.toLocaleString()}
            </h3>
          </div>

          <div className="h-100">
            <Bar
              data={salesData.chartData}
              options={options}
              className="w-100 canvas"
            />
          </div>

          {/* <div className="d-flex justify-content-center mt-3">
            <p
              className="mb-0 p-2 text-center"
              style={{
                backgroundColor: 'blue',
                color: 'white',
                width: 'fit-content',
              }}
            >
              {salesData.processedPercentage}% Processed
            </p>
          </div> */}
        </Card.Body>
      </Card>

    );
  };


  // Style for the container and center label
  const centerLabelStyle = {
    position: 'absolute',
    top: '60%',
    left: '32%',
    transform: 'translate(-50%, -50%)',
    textAlign: 'center',
    fontSize: '10px',
    fontWeight: 'bold',
    color: 'white',
    border: "1px solid blue",
    backgroundColor: "blue",
    borderRadius: "5px",

  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedProductImage, setSelectedProductImage] = useState("");
  const [selectedTake, setSelectedTake] = useState(null);
  const [isForumModalOpen, setIsForumModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    quantity: "",
    distributor_name: "",
    location: "",
    phone_number: "",
  });
  const [forums, setForums] = useState([]);
  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${baseurl}/api/getAllProducts`);
      setProducts(response.data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]); // Fallback to empty array in case of error
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  const fetchForums = async () => {
    try {
      const response = await axios.get(`${baseurl}/api/forums`);
      const allForums = response.data?.data || [];
      const latestForums = allForums
        .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
        .slice(0, 4);

      setForums(latestForums);
    } catch (error) {
      console.error("Error fetching forums:", error);
    }
  };
  // Fetch forums
  useEffect(() => {
    fetchForums();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, []);
  const handleOpenModal = async (take) => {
    try {
      const response = await axios.get(`${baseurl}/api/forumtakebyid/${take.fid}`);
      setSelectedTake(response.data.data[0]);
      setError(null);
    } catch (err) {
      setError('Failed to fetch forum takes');
      console.error('Error fetching forum takes:', err);
    }
    setIsForumModalOpen(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setSelectedTake(null);
    setIsForumModalOpen(false);
  };

  const handleProductChange = (event) => {
    const selectedProductName = event.target.value;
    setSelectedProduct(selectedProductName);
    const selectedProduct = products.find(
      (product) => product.product_name === selectedProductName
    );
    if (selectedProduct) {
      setSelectedProductImage(selectedProduct.image_path);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selectedProduct || !formData.quantity || !formData.name || !formData.phone_number) {
      Swal.fire({
        icon: 'warning',
        title: 'Incomplete Form',
        text: 'Please fill in all required fields.',
        confirmButtonText: 'OK',
        confirmButtonColor: '#3085d6'
      });
      return;
    }

    const submissionData = {
      user_id: user.aid,
      product_name: selectedProduct,
      quantity: formData.quantity,
      name: formData.name,
      phone_number: formData.phone_number,
    };

    try {
      const response = await axios.post(`${baseurl}/api/forum`, submissionData);
      if (response.status === 201 && response.data?.message === "Forum created successfully") {
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: response.data.message,
          confirmButtonText: 'OK',
          confirmButtonColor: '#3085d6'
        });
        setFormData({
          quantity: "",
          name: "",
          phone_number: "",
        });
        fetchProducts();
        fetchForums();
        setSelectedProduct("");
        setSelectedProductImage("");
        setIsModalOpen(false);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Submission Failed',
          text: response.data.message,
          confirmButtonText: 'Retry',
          confirmButtonColor: '#d33'
        });
      }
    } catch (error) {
      console.error("Submission Error:", error);
      Swal.fire({
        icon: 'error',
        title: 'Submission Error',
        text: 'Failed to submit. Please check your network or contact support.',
        confirmButtonText: 'OK',
        confirmButtonColor: '#d33'
      });
    }
  }
  const calculatePercentageChange = (current, previous) => {
    if (previous === 0) return '0% from yesterday';
    const percentageChange = ((current - previous) / previous) * 100;
    const direction = percentageChange >= 0 ? 'Up' : 'Down';
    return `${Math.abs(percentageChange).toFixed(1)}% ${direction} from yesterday`;
  };
  const calculatePercentageChangeInWeek = (current, previous) => {
    if (previous === 0) return '0% from past week';
    const percentageChange = ((current - previous) / previous) * 100;
    const direction = percentageChange >= 0 ? 'Up' : 'Down';
    return `${Math.abs(percentageChange).toFixed(1)}% ${direction} from past week`;
  };

  const calculatePreviousUsers = (users) => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const previousTechnicians = users.filter(user =>
      user.role === 'technician' &&
      new Date(user.createdAt) < yesterday
    ).length;

    return previousTechnicians;
  }
  const calculatePreviousUsersDistributors = (users) => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const previousDistributors = users.filter(user =>
      user.role === 'distributor' &&
      new Date(user.createdAt) < yesterday
    ).length;

    return previousDistributors;
  }
  const calculatePreviousWeekSales = (orders) => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const previousWeekSales = orders
      .filter(order =>
        order.status === 'Done' &&
        new Date(order.completeAt) >= oneWeekAgo &&
        new Date(order.completeAt) <= new Date()
      )
      .reduce((total, order) => total + parseFloat(order.totalAmount || 0), 0);

    return previousWeekSales;
  };

  // console.log(calculatePreviousSales(orders))
  const calculatePastWeekOrders = (orders) => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const pastWeekOrders = orders.filter(order =>
      new Date(order.createdAt) >= oneWeekAgo &&
      new Date(order.createdAt) < new Date()
    ).length;

    return pastWeekOrders;
  }

  return (
    <div className="container-fluid p-4">
      {/* Stats Cards Row */}
      <div className="row mb-4">
        {[
          {
            title: 'Technician',
            value: stats.totalUsers,
            percentage: calculatePercentageChange(stats.totalUsers, calculatePreviousUsers(technicians)),
            icon: 'bi-people',
            iconClass: 'text-primary',
            bgClass: 'bg-primary bg-opacity-10',
          },
          {
            title: 'Week Order',
            value: stats.totalOrders,
            percentage: calculatePercentageChangeInWeek(stats.totalOrders, calculatePastWeekOrders(orders)),
            icon: 'bi-box',
            iconClass: 'text-warning',
            bgClass: 'bg-warning bg-opacity-10',
          },
          {
            title: 'Week Sales',
            value: (
              <div className="flex items-center">
                <i className="bi bi-currency-rupee mr-1"></i>
                {stats.totalSales.toFixed(2)}
              </div>
            ),
            percentage: calculatePercentageChangeInWeek(stats.totalSales, calculatePreviousWeekSales(orders)),
            icon: 'bi-graph-up',
            iconClass: 'text-success',
            bgClass: 'bg-success bg-opacity-10',
          },
          {
            title: 'Distributor',
            value: stats.totalUsersDistributor,
            percentage: calculatePercentageChange(stats.totalUsersDistributor, calculatePreviousUsersDistributors(distributors)),
            icon: 'bi-clock',
            iconClass: 'text-danger',
            bgClass: 'bg-danger bg-opacity-10',
          },
        ].map((card, idx) => (
          <div className="col-md-3 mb-2" key={idx} style={{ display: "flex", flexDirection: "column" }}>
            <div className="card" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <div className="card-body" style={{ flex: 1 }}>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <p className="text-muted mb-3">{card.title}</p>
                    <h4 className="mb-3" style={{ fontWeight: "bold" }}>{card.value}</h4>
                    <small className={`text-${card.iconClass.split('-')[1]}`}>
                      <i className={`bi bi-arrow-${card.percentage.includes('Up') ? 'up' : 'down'}`}></i> {card.percentage}
                    </small>
                  </div>
                  <div
                    className={`${card.bgClass} p-3 rounded-circle`} // Use `rounded-circle` for a fully rounded icon
                    style={{
                      position: "absolute",
                      top: "10px",
                      right: "10px",
                      width: "40px", // Ensure size for rounded appearance
                      height: "40px", // Ensure size for rounded appearance
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      borderRadius: "50%", // Full circle shape
                    }}
                  >
                    <i className={`bi ${card.icon} ${card.iconClass} fs-4`}></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Forum Section */}
      <div className="row mb-4">
        <div className="col-12 d-flex justify-content-between align-items-center mb-3">
          <h4 className="mb-0" style={{ fontWeight: "bold" }}>Forum</h4>
        </div>

        {/* Looping through forum items */}
        {forums.map((forum) => {
          // Find the matching product for each forum
          const matchingProduct = products.find(product => product.product_name === forum.product_name);

          return (
            <div key={forum.fid} className="col-md-6 mb-3">
              <div className="card">
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-3">
                      <img
                        src={
                          matchingProduct?.images?.[0]?.image_path
                            ? `${baseurl}/${matchingProduct.images[0].image_path}`
                            : Compressor
                        }
                        alt={matchingProduct?.product_name || "Product"}
                        className="img-fluid rounded"
                        style={{
                          width: "100%",
                          marginTop: "40px",
                          objectFit: "cover",
                        }}
                      />
                    </div>
                    <div className="col-md-9">
                      <div style={{ marginBottom: "20px" }}>
                        <div className="mb-2">
                          <div className="d-flex justify-content-between"><span>Post by{" "}: </span><span>{forum.name || "Unknown"}</span></div>
                          <div className="d-flex justify-content-between">
                            <span>Close Date{" "}:</span>
                            <span>{forum.close_date
                              ? new Date(
                                forum.close_date
                              ).toLocaleDateString()
                              : "No Date"}</span>

                          </div>
                        </div>
                        <div style={{ height: '120px', overflowY: 'auto' }}>
                          <table className="table table-bordered mt-3">
                            <thead>
                              <tr>
                                <th>Product Name</th>
                                <th>Quantity</th>
                              </tr>
                            </thead>
                            <tbody>
                              {forum.forumProducts.map((forumProduct, index) => (
                                <tr key={index}>
                                  <td>{forumProduct.product_name || "N/A"}</td>
                                  <td>{forumProduct.quantity || "N/A"}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                      </div>
                      <div
                        style={{ display: "flex", justifyContent: "flex-end" }}
                      >
                        <button
                          className="btn"
                          style={{
                            backgroundColor: "blue",
                            color: "white",
                            border: "none",
                          }}
                          onClick={() =>
                            forum.status === "Taken" ? handleOpenModal(forum) : ''}
                        >
                          {forum.status === "Taken"
                            ? "View Details"
                            : "Not Taken Forum"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Order Summary and Charts Row */}
      <div className="row">
        <div className="col-md-4 mb-3">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title mb-5">Order Summary</h5>
              <div className="list-group">
                <div className="list-group-item p-3">
                  All Orders ({orderSummary.received + orderSummary.shipping + orderSummary.canceled + orderSummary.done})
                </div>
                <div className="list-group-item bg-light p-3">
                  Received ({orderSummary.received})
                </div>
                <div
                  className="list-group-item p-3"
                  style={{ backgroundColor: "#FFF8E7" }}
                >
                  Shipping ({orderSummary.shipping})
                </div>
                {/* <div
                  className="list-group-item p-3"
                  style={{ backgroundColor: "#FFC8C8" }}
                >
                  Complaint ({orderSummary.complaint})
                </div> */}
                <div
                  className="list-group-item p-3"
                  style={{ backgroundColor: "#FFE7E7" }}
                >
                  Canceled ({orderSummary.canceled})
                </div>
                <div
                  className="list-group-item p-3"
                  style={{ backgroundColor: "#E7FFE7" }}
                >
                  Deliverd ({orderSummary.done})
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-3"><SalesPieChart orders={orders} /></div>
        <div className="col-md-4 mb-3"><SalesComparisonCard ordersData={orders} /></div>

        {/* <div className="col-md-4">
          <div className="card h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="card-title mb-0">Average sales</h5>
                <select className="form-select w-auto">
                  <option>Month</option>
                </select>
              </div>
              <h3><i class="bi bi-currency-rupee"></i> 975,993</h3>
              <Pie data={data} options={options} />
              <div className="center-label" style={centerLabelStyle}>
                <p>
                  95%<br />
                  on Process
                </p>
              </div>
            </div>
          </div>
        </div> */}

        {/* <div className="col-md-4">
          <div className="card h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="card-title mb-0">Average visitor</h5>
                <select className="form-select w-auto">
                  <option>Weekly</option>
                </select>
              </div>
              <h3>560,395</h3>
              <div
                className="d-flex justify-content-between align-items-end"
                style={{ height: '150px' }}
              >
                {['Mon', 'Tue', 'Wed', 'Thu'].map((day, idx) => (
                  <div key={idx} className="d-flex flex-column align-items-center">
                    <div
                      className="bg-primary"
                      style={{
                        width: '20px',
                        height: `${Math.random() * 100 + 20}px`,
                      }}
                    ></div>
                    <small className="mt-2">{day}</small>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div> */}
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <span className="close-button" onClick={toggleModal}>
              &times;
            </span>
            <h4 className="sideHeading mb-4">
              Tell us what you need, and we'll help you get quotes
            </h4>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label>Product Name</label>
                <select
                  className="form-select"
                  value={selectedProduct}
                  onChange={handleProductChange}
                >
                  <option value="" disabled>
                    Select Product Name
                  </option>
                  {products.map((product) => (
                    <option key={product.pid} value={product.product_name}>
                      {product.product_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label>Quantity</label>
                <input
                  type="number"
                  name="quantity"
                  className="form-control"
                  placeholder="Enter Quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                />
              </div>
              <div className="mb-3">
                <label>Name</label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  placeholder="Enter Your Name"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>
              <div className="mb-3">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phone_number"
                  className="form-control"
                  placeholder="Enter Your Phone Number"
                  value={formData.phone_number}
                  onChange={handleInputChange}
                />
              </div>
              <button type="submit" className="btn btn-primary">
                Submit Requirement
              </button>
            </form>
          </div>
        </div>
      )}
      {isForumModalOpen && (
        <div
          className={`modal fade ${isForumModalOpen ? 'show' : ''}`}
          style={{
            display: isForumModalOpen ? 'block' : 'none',
            backgroundColor: 'rgba(0,0,0,0.5)',
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 1050
          }}
          onClick={handleCloseModal}
          tabIndex="-1"
        >
          <div
            className="modal-dialog modal-dialog-centered modal-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Forum Take Details</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCloseModal}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <div className="row mb-2">
                  <div className="col-6 fw-bold">Distributor Name:</div>
                  <div className="col-6">{selectedTake.distributorName}</div>
                </div>
                <div className="row mb-2">
                  <div className="col-6 fw-bold">Distributor Email:</div>
                  <div className="col-6">{selectedTake.distributorEmail}</div>
                </div>
                <div className="row mb-2">
                  <div className="col-6 fw-bold">Distributor Phone:</div>
                  <div className="col-6">{selectedTake.distributorPhone}</div>
                </div>
                <div className="row mb-2">
                  <div className="col-6 fw-bold">Distributor Address:</div>
                  <div className="col-6">{selectedTake.distributorAddress}</div>
                </div>
                <div className="row">
                  <div className="col-6 fw-bold">Taken At:</div>
                  <div className="col-6">{new Date(selectedTake.takenAt).toLocaleString()}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>

  );
};

export default EnterpriseAi;
