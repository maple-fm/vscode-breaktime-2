window.addEventListener('DOMContentLoaded', function(){
    showGraph();

    loadFile();
    // const graphElement = document.getElementsByName('analysis');
    // const checkValue = '';

    // graphElement.item.array.forEach(element => {
    //     for(const element of input_genders) {
    //         element.addEventListener('change',function(){
    //             if( this.item. ) {
    //                 showGraph(this)
    //             }
    //         });
    //     }
    // });
});



function loadFile(){
    const fs = require('fs');
    const filePath = './test.txt';

    const text = fs.readFileSync(filePath, 'utf8');
    const lines = text.toString().split('\r\n');

    for (const idx = 0; idx < lines.length; idx++) {
        console.log(lines[idx]);
    }
}

function showGraph(){
    const ctx = document.getElementById('graph');
    const chart = new window.Chart(ctx, {
        // 縦棒グラフ
        type: 'bar',
        data: {
            labels: ['a', 'b', 'c', 'd', 'e', 'f'],
            datasets: [{
                label: '# of lines',
                data: [12, 19, 3, 5, 2, 3],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 1
            }]
        }
    });
}

