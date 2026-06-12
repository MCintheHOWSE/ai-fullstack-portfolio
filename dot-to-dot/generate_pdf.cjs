const fs = require('fs');
const { mdToPdf } = require('md-to-pdf');

(async () => {
    try {
        const pdf = await mdToPdf({ path: 'Dot_to_Dot_Project_Report.md' }, { dest: 'Dot_to_Dot_Project_Report.pdf' });
        if (pdf) {
            console.log('PDF generated successfully');
        }
    } catch (error) {
        console.error('PDF generation failed:', error);
        process.exit(1);
    }
})();
