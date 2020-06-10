import React from 'react';
import { Tabs } from 'antd';
import Graph from './components/graph/graph';
import Box from './components/box';
import Box1 from './components/point';
import Line from './components/line';
import Grid from './components/grid';

// import logo from './logo.svg';
import 'antd/dist/antd.css';
import './App.css';

const { TabPane } = Tabs;

class App extends React.Component {
    render() {
        return (
            <div>
                <Tabs
                    defaultActiveKey="0"
                    tabPosition={'left'}
                    style={{ minWidth: 400 }}
                    size="large"
                >
                    <TabPane tab={`图谱`} key="0">
                        <Graph />
                    </TabPane>
                    <TabPane tab={`立方体`} key="1">
                        <Box />
                    </TabPane>
                    <TabPane tab={`点`} key="2">
                        <Box1 />
                    </TabPane>
                    <TabPane tab={`线`} key="3">
                        <Line />
                    </TabPane>
                    <TabPane tab={`网格`} key="4">
                        <Grid />
                    </TabPane>
                </Tabs>
            </div>
        );
    }
}

export default App;
