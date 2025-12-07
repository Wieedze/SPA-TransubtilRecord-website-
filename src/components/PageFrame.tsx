export default function PageFrame() {
  return (
    <>
      {/* Clip path definition - invisible SVG for clipping */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <clipPath id="page-frame-clip" clipPathUnits="objectBoundingBox">
            {/* Rectangle scaled to 0-1 range - leaves margin on all sides */}
            <rect x="0.02" y="0.037" width="0.96" height="0.926" />
          </clipPath>
        </defs>
      </svg>

      <div className="fixed inset-0 pointer-events-none z-50">
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 1920 1080"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          className="w-full h-full"
        >
          <defs>
            <style>{`
              .frame-stroke {
                fill: none;
                stroke: #fff;
                stroke-miterlimit: 10;
                stroke-width: 2px;
                opacity: 0.3;
              }
            `}</style>
          </defs>

        {/* Main border rectangle */}
        <rect className="frame-stroke" x="30" y="30" width="1860" height="1020" />

        {/* Top right corner detail */}
        <path className="frame-stroke" d="M1810,30c5.14-4.99,10.29-9.98,15.43-14.97c20.11.15,40.23.31,60.34.46,2.69,2.53,5.37,5.07,8.06,7.6.31,20.73.61,41.46.92,62.19-5.37,5.45-10.75,10.9-16.12,16.35V30h-68.64Z" />

        {/* Bottom left corner detail */}
        <path className="frame-stroke" d="M110,1050c-5.14,4.99-10.29,9.98-15.43,14.97c-20.11-.15-40.23-.31-60.34-.46-2.69-2.53-5.37-5.07-8.06-7.6-.31-20.73-.61-41.46-.92-62.19,5.37-5.45,10.75-10.9,16.12-16.35v71.63h68.64Z" />

        {/* Left side vertical detail */}
        <path className="frame-stroke" d="M40,400c-5.45-4.61-10.89-9.21-16.34-13.82V200c5.45.31,10.89.61,16.34.92v199.08Z" />

        {/* Right side vertical detail */}
        <path className="frame-stroke" d="M1880,680c5.45,4.61,10.89,9.21,16.34,13.82v186c-5.45-.31-10.89-.61-16.34-.92V680Z" />
      </svg>
    </div>
    </>
  )
}
