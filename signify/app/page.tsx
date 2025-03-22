"use client";
import { useAccount, useConnect, useDisconnect, useEnsAvatar, useEnsName } from "wagmi";
import { injected, metaMask, walletConnect } from "wagmi/connectors";

export default function Home() {
  return( <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "flex-start",
      minHeight: "100vh",
      width: "100%",
      background: "linear-gradient(to bottom, #f8f5f0 50%, #f1deac 100%)",
      backgroundRepeat: "no-repeat",
      backgroundAttachment: "fixed",
      margin: 0,
      padding: 0,
      
    }}
  >
    <div
      style={{
        width: "90%",
        height: "95vh",
        border: "5px solid black",
        margin: "20px",
        padding: "20px",
        boxSizing: "border-box",
        borderRadius: "10px",
        background: "#fff",
      }}
    >
      <main>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "60px",
            gap: "50px",
            height: "100vh",
          }}
        >
          {/* Left Side: Cards Section */}
          <section style={{ display: "flex", flexDirection: "column", gap: "25px", flex: 1, marginTop: "100px" }}>
            {[
              {
                img: "images/image1.jpg",
                title: "Explore Indie Artists",
                text: "Many talented independent artists who are yet to experience the limelight and their art of music can be found and explored here.",
              },
              {
                img: "images/image2.jpg",
                title: "Secure contracts with NFTs",
                text: "NFTs will be minted and transferred to the artists as well as the record label once the contract is established.",
              },
              {
                img: "images/image3.jpg",
                title: "Transparent payments",
                text: "The payment of the artists will be fully transparent. Artists will be rewarded every penny which they earn.",
              },
            ].map((card, index) => (
              <div
                key={index}
                style={{
                  background: "#d4a373",
                  padding: "20px",
                  borderRadius: "15px",
                  boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                  textAlign: "center",
                  width: "320px",
                  transition: "transform 0.3s",
                  marginLeft: index === 0 ? "300px" : index === 1 ? "30px" : "400px",
                  marginTop: index === 0 ? "200px" : index === 2 ? "-10px" : "0",
                }}
              >
                <img
                  src={card.img}
                  alt={card.title}
                  style={{ width: "100%", height: "180px", objectFit: "cover", borderRadius: "10px" }}
                />
                <h3>{card.title}</h3>
                <p>{card.text}</p>
              </div>
            ))}
          </section>

          {/* 3D Vertical Divider */}
          <div
            style={{
              width: "8px",
              height: "80vh",
              background: "linear-gradient(to bottom, #999, #444)",
              boxShadow: "2px 0 6px rgba(0, 0, 0, 0.3)",
              borderRadius: "10px",
            }}
          ></div>

          {/* Right Side: About Section */}
          <section style={{ flex: 1, maxWidth: "500px", paddingLeft: "20px",marginBottom: "100px" }}>
            <h1 style={{ fontSize: "70px", fontWeight: "lighter", textShadow: "1.5px 1.5px 3px grey" }}>
              REDEFINING THE INDIE SCENE
            </h1>
            <p style={{ color: "#555", fontSize: "28px" }}>
              Signify is a revolutionary Web3-powered platform designed to transform the music industry by ensuring
              secure and transparent transactions between artists and record labels. By leveraging blockchain
              technology, Signify empowers independent artists to showcase their talent, gain visibility, and receive
              direct engagement from fans and industry professionals.
            </p>
          </section>
        </div>

        {/* Box Section */}
        <section style={{ display: "flex", flexDirection: "column", gap: "25px", flex: 1,marginTop: "140px" }}>
          {["images/retro1.jpg", "images/retro2.jpg", "images/retro3.jpg"].map((img, index) => (
            <div
              key={index}
              style={{
                width: index === 2 ? "370px" : index === 1 ? "260px" : "230px",
                height: index === 2 ? "280px" : index === 1 ? "380px" : "350px",
                background: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "10px",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                transition: "transform 0.3s, background 0.3s",
                zIndex: "10",
                transform: index === 0 ? "rotate(-10deg)" : index === 1 ? "rotate(15deg)" : "rotate(-5deg)",
                marginTop: index === 0 ? "-1000px" : index === 1 ? "-10px" : "70px",
                marginLeft: index === 0 ? "20px" : index === 1 ? "600px" : "25px",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = index === 0 ? "rotate(-5deg) scale(1.1)" : index === 1 ? "rotate(10deg) scale(1.1)" : "rotate(0deg) scale(1.1)";
                e.currentTarget.style.background = "#ff9900";
                e.currentTarget.style.color = "white";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = index === 0 ? "rotate(-10deg)" : index === 1 ? "rotate(15deg)" : "rotate(-5deg)";
                e.currentTarget.style.background = "#ffffff";
                e.currentTarget.style.color = "#333";
              }}
            >
              <img src={img} alt="Retro Art" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "5px" }} />
            </div>
          ))}
        </section>
      </main>
    </div>
  </div>)
}


