import { DownOutlined, PlusOutlined, MailOutlined } from '@ant-design/icons';
import { Button, Divider, Dropdown, Menu, message } from 'antd';
import React, { useState, useRef } from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import ProTable, { ProColumns, ActionType } from '@ant-design/pro-table';
import CreateForm from './components/CreateForm';
import InviteForm from './components/InviteForm';
import UpdateForm, { FormValueType } from './components/UpdateForm';
import UpdateNotesForm from './components/UpdateNotesForm';
import { TableListItem } from './data.d';
import { queryRule, updateRule, addRule, removeRule } from './service';

/**
 * 添加节点
 * @param fields
 */
const handleAdd = async (fields: FormValueType) => {
  const hide = message.loading('正在添加');
  try {
    await addRule({
      desc: fields.desc,
    });
    hide();
    message.success('添加成功');
    return true;
  } catch (error) {
    hide();
    message.error('添加失败请重试！');
    return false;
  }
};

/**
 * 更新节点
 * @param fields
 */
const handleUpdate = async (fields: FormValueType) => {
  console.log(fields);
  const hide = message.loading('正在配置');
  try {
    await updateRule({
      name: fields.name,
      desc: fields.desc,
      key: fields.key,
    });
    hide();

    message.success('配置成功');
    return true;
  } catch (error) {
    hide();
    message.error('配置失败请重试！');
    return false;
  }
};

/**
 *  删除节点
 * @param selectedRows
 */
const handleRemove = async (selectedRows: TableListItem[]) => {
  const hide = message.loading('正在删除');
  if (!selectedRows) return true;
  try {
    await removeRule({
      key: selectedRows.map(row => row.key),
    });
    hide();
    message.success('删除成功，即将刷新');
    return true;
  } catch (error) {
    hide();
    message.error('删除失败，请重试');
    return false;
  }
};

const TableList: React.FC<{}> = () => {
  const [createModalVisible, handleModalVisible] = useState<boolean>(false);
  const [updateModalVisible, handleUpdateModalVisible] = useState<boolean>(false);
  const [inviteModalVisible, setInviteModalVisible] = useState<boolean>(false);
  const [stepFormValues, setStepFormValues] = useState({});
  const actionRef = useRef<ActionType>();
  const columns: ProColumns<TableListItem>[] = [
    {
      title: 'ID',
      dataIndex: 'key',
      renderText: (val: string) => `HSF-${val}`,
    },
    {
      title: 'Name',
      dataIndex: 'name',
    },
    {
      title: 'Notes',
      dataIndex: 'desc',
    },
    // {
    //   title: 'No',
    //   dataIndex: 'callNo',
    //   sorter: true,
    //   renderText: (val: string) => `${val} 万`,
    // },
    // {
    //   title: 'Status',
    //   dataIndex: 'status',
    //   valueEnum: {
    //     0: { text: '关闭', status: 'Default' },
    //     1: { text: '运行中', status: 'Processing' },
    //     2: { text: '已上线', status: 'Success' },
    //     3: { text: '异常', status: 'Error' },
    //   },
    // },
    {
      title: 'Role',
      dataIndex: 'role',
      sorter: true,
      valueEnum: {
        0: { text: 'Student', role: 'Student' },
        1: { text: 'Recommender', role: 'Recommender' },
        2: { text: 'Admin', role: 'Admin' },
        3: { text: 'Interviewer', role: 'Interviewer' },
      },
    },
    {
      title: 'Alumni?',
      dataIndex: 'isAlumni',
      sorter: true,
      valueEnum: {
        0: { text: 'Yes', isAlumni: 'Yes' },
        1: { text: 'No', isAlumni: 'No' },
      },
    },
    // {
    //   title: '上次调度时间',
    //   dataIndex: 'updatedAt',
    //   sorter: true,
    //   valueType: 'dateTime',
    // },
    {
      title: 'Actions',
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record) => (
        <>
          <a
            onClick={() => {
              handleUpdateModalVisible(true);
              setStepFormValues(record);
            }}
          >
            Edit
          </a>
          {/* <Divider type="vertical" />
          <a href="">订阅警报</a> */}
        </>
      ),
    },
  ];

  return (
    <PageHeaderWrapper>
      <ProTable<TableListItem>
        headerTitle="Users"
        actionRef={actionRef}
        rowKey="key"
        toolBarRender={(action, { selectedRows }) => [
          <Button icon={<PlusOutlined />} type="primary" onClick={() => handleModalVisible(true)}>
            New
          </Button>,
          selectedRows && selectedRows.length > 0 && (
            <Button
              icon={<MailOutlined />}
              type="primary"
              onClick={() => setInviteModalVisible(true)}
            >
              Invite
            </Button>
          ),
          selectedRows && selectedRows.length > 0 && (
            <Dropdown
              overlay={
                <Menu
                  onClick={async e => {
                    if (e.key === 'remove') {
                      await handleRemove(selectedRows);
                      action.reload();
                    }
                  }}
                  selectedKeys={[]}
                >
                  <Menu.Item key="remove">批量删除</Menu.Item>
                  <Menu.Item key="approval">批量审批</Menu.Item>
                </Menu>
              }
            >
              <Button>
                批量操作 <DownOutlined />
              </Button>
            </Dropdown>
          ),
        ]}
        tableAlertRender={(selectedRowKeys, selectedRows) => (
          <div>
            Selected <a style={{ fontWeight: 600 }}>{selectedRowKeys.length}</a> users&nbsp;&nbsp;
            {/* <span>
              服务调用次数总计 {selectedRows.reduce((pre, item) => pre + item.callNo, 0)} 万
            </span> */}
          </div>
        )}
        search={{ searchText: 'Search', resetText: 'Reset' }}
        request={params => queryRule(params)}
        columns={columns}
        rowSelection={{}}
      />

      <CreateForm
        onSubmit={async value => {
          const success = await handleAdd(value);
          if (success) {
            handleModalVisible(false);
            if (actionRef.current) {
              actionRef.current.reload();
            }
          }
        }}
        onCancel={() => handleModalVisible(false)}
        modalVisible={createModalVisible}
      />

      <InviteForm
        onSubmit={async value => {
          const success = await handleAdd(value);
          if (success) {
            handleModalVisible(false);
            if (actionRef.current) {
              actionRef.current.reload();
            }
          }
        }}
        onCancel={() => setInviteModalVisible(false)}
        modalVisible={inviteModalVisible}
      />

      {stepFormValues && Object.keys(stepFormValues).length ? (
        // <UpdateForm
        <UpdateNotesForm
          onSubmit={async value => {
            const success = await handleUpdate(value);
            if (success) {
              handleModalVisible(false);
              setStepFormValues({});
              if (actionRef.current) {
                actionRef.current.reload();
              }
            }
          }}
          onCancel={() => {
            handleUpdateModalVisible(false);
            setStepFormValues({});
          }}
          updateModalVisible={updateModalVisible}
          values={stepFormValues}
        />
      ) : null}
    </PageHeaderWrapper>
  );
};

export default TableList;
