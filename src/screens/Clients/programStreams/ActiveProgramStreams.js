import React, { Component } from 'react'
import { StyleSheet, View, Text, ScrollView, TouchableWithoutFeedback, ActivityIndicator, Alert } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { Divider, SearchBar } from 'react-native-elements'
import { programStreamStyles } from '../../../styles'
import { pushScreen } from '../../../navigation/config'
import _ from 'lodash'
import appIcon from '../../../utils/Icon'
import { Navigation } from 'react-native-navigation'
import { connect } from 'react-redux'
class ActiveProgramStreams extends Component {
  constructor(props) {
    super(props)

    this.state = {
      original_program_streams: [],
      program_streams: [],
      isLoading: true,
      client: this.props.client
    }
  }

  componentWillMount() {
    const self = this
    const { programStreams, client } = this.props
    const clientProgram = _.map(client.program_streams, 'id')
    const inActiveProgram = _.map(client.inactive_program_streams, 'id')

    let enrolledPrograms = []
    let unEnrollPrograms = []

    const programStreamReorders = _.map(programStreams, program_stream => {
      if (inActiveProgram.includes(program_stream.id)) {
        enrolledPrograms = [program_stream, ...enrolledPrograms]
      } else {
        if (!clientProgram.includes(program_stream.id)) {
          unEnrollPrograms = [program_stream, ...unEnrollPrograms]
        }
      }
      return program_stream
    })

    unEnrollPrograms = _.orderBy(unEnrollPrograms, [program_stream => program_stream.name.toLowerCase()], ['asc'])
    const mergePrograms = enrolledPrograms.concat(unEnrollPrograms)

    setTimeout(function() {
      self.setState({
        program_streams: mergePrograms,
        original_program_streams: mergePrograms,
        isLoading: false,
        isFiltering: false
      })
    }, 2500)
  }

  _enrollClient(program_stream, client_program_stream) {
    const { client } = this.state
    const clientsEnrollAble = program_stream.enrollable_client_ids
    const activeProgram = _.filter(client.inactive_program_streams, clientProgram => {
      return clientProgram.id == program_stream.id
    })
    if (!_.isEmpty(program_stream.program_exclusive) || !_.isEmpty(program_stream.mutual_dependence)) {
      if (!_.isEmpty(program_stream.program_exclusive)) {
        if (program_stream.program_exclusive.includes(program_stream.id)) {
          Alert.alert('Warning', "Client desn't match with this program rules")
        } else {
          this._handleClietEnroll(clientsEnrollAble, client_program_stream, client)
        }
      } else {
        if (program_stream.mutual_dependence.includes(program_stream.id)) {
          this._handleClietEnroll(clientsEnrollAble, client_program_stream, client)
        } else {
          Alert.alert('Warning', "Client desn't match with this program rules")
        }
      }
    } else {
      this._handleClietEnroll(clientsEnrollAble, client_program_stream, client)
    }
  }

  _handleClietEnroll(clientsEnrollAble, program_stream, client) {
    if (clientsEnrollAble != null) {
      if (clientsEnrollAble.includes(client.id)) {
        this._renderEnrollForm(program_stream, client)
      } else {
        Alert.alert('Message', "Client desn't match with this program rules")
      }
    } else {
      this._renderEnrollForm(program_stream, client)
    }
  }

  async _renderEnrollForm(program_stream, client) {
    const icons = await appIcon()
    pushScreen(this.props.componentId, {
      screen: 'oscar.enrollmentForm',
      title: `Enroll ${program_stream.name}`,
      props: {
        programStream: program_stream,
        client: client,
        programStreams: this.state.program_streams,
        originalProgramStreams: this.state.original_program_streams,
        clientDetailComponentId: this.props.clientDetailComponentId,
        createEnrollment: this.createEnrollment
      },
      rightButtons: [
        {
          id: 'SAVE_ENROLLMENT',
          icon: icons.save,
          color: '#fff'
        }
      ]
    })
  }

  _checkProgramStream(program_stream, status) {
    const { client } = this.state
    if (status == 'Exited') {
      let findProgramStream = _.filter(client.inactive_program_streams, { id: program_stream.id })
      findProgramStream = findProgramStream[0]
      this._enrollClient(program_stream, findProgramStream)
    } else {
      this._enrollClient(program_stream, program_stream)
    }
  }

  _searchProgramStream(text) {
    const { program_streams, original_program_streams } = this.state
    this.setState({ isFiltering: true })

    let filterProgramStreams = []

    if (text != '' && text.length >= 1) {
      filterProgramStreams = _.filter(original_program_streams, program_stream => {
        let name = program_stream.name.toLowerCase()
        return name.includes(text.toLowerCase())
      })
    } else if (text == '') {
      filterProgramStreams = original_program_streams
    }

    if (filterProgramStreams.length <= 0 && (text != '' && text.length >= 1)) {
      filterProgramStreams = original_program_streams
      Alert.alert('Message', `No program stream found with the following name "${text}"`)
    }
    this.setState({ isFiltering: false, program_streams: filterProgramStreams })
  }

  _viewProgramStream(program_stream) {
    pushScreen(this.props.componentId, {
      screen: 'oscar.programStreamDetail',
      title: program_stream.name,
      props: {
        programStreamId: program_stream.id,
        clientId: this.state.client.id,
        clientDetailComponentId: this.props.clientDetailComponentId
      }
    })
  }

  _renderViewReport(status, inActiveProgram) {
    return (
      <View style={{ flex: 1 }}>
        {status == 'Exited' ? (
          <TouchableWithoutFeedback onPress={() => this._viewProgramStream(inActiveProgram[0])}>
            <View style={programStreamStyles.buttonWrapper}>
              <Text style={programStreamStyles.buttonTitle}>VIEW</Text>
            </View>
          </TouchableWithoutFeedback>
        ) : (
          <View style={[programStreamStyles.buttonWrapperNotTracking, { borderTopRightRadius: 10 }]}>
            <Text style={programStreamStyles.buttonTitle}>VIEW</Text>
          </View>
        )}
      </View>
    )
  }

  componentWillUnmount() {
    this.setState({
      original_program_streams: [],
      program_streams: [],
      isLoading: true
    })
  }

  render() {
    const { program_streams, isLoading, isFiltering, client } = this.state
    if (isLoading) {
      return (
        <View
          style={{
            backgroundColor: '#fff',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
            flexDirection: 'row'
          }}
        >
          <ActivityIndicator color="#009999" size="large" />
          <Text style={{ fontSize: 16, marginLeft: 8 }}>Loading...</Text>
        </View>
      )
    } else {
      return (
        <View style={programStreamStyles.mainContainer}>
          <SearchBar
            lightTheme
            round
            placeholder="Search program stream name"
            autoCapitalize="none"
            textInputRef="clear"
            onChangeText={text => this._searchProgramStream(text)}
            noIcon
            showLoadingIcon={isFiltering}
          />
          <ScrollView style={programStreamStyles.mainContainer}>
            {_.map(program_streams, (program_stream, index) => {
              let status = ''
              const clientProgram = _.filter(client.program_streams, clientProgram => {
                return clientProgram.id == program_stream.id
              })

              const inActiveProgram = _.filter(client.inactive_program_streams, clientProgram => {
                return clientProgram.id == program_stream.id
              })

              if (clientProgram.length > 0 && inActiveProgram.length == 0) {
                status = 'Active'
              } else if (inActiveProgram.length > 0) {
                status = 'Exited'
              }
              return (
                <View key={index} style={programStreamStyles.container}>
                  <View style={programStreamStyles.leftSide}>
                    <View style={programStreamStyles.leftSideWrapper}>
                      {status != '' && (
                        <View style={[programStreamStyles.statusWrapper, { width: 80, backgroundColor: status == 'Exited' ? '#ed5565' : '#009999' }]}>
                          <Text style={[programStreamStyles.statusTitle, { fontSize: 12 }]}>{status}</Text>
                        </View>
                      )}
                      <Text style={programStreamStyles.programStreamTitle}>{program_stream.name}</Text>

                      <Divider style={programStreamStyles.titleDivider} />

                      <View style={programStreamStyles.quantityWrapper}>
                        <Text style={programStreamStyles.quantityKey}>Number of Place Available:</Text>
                        <Text style={programStreamStyles.quantityValue}>{program_stream.quantity}</Text>
                      </View>

                      <View style={programStreamStyles.domainWrapper}>
                        <Text style={programStreamStyles.domainKey}>Domain:</Text>
                        <View style={programStreamStyles.domainValue}>
                          {_.map(program_stream.domain, (domain, dIndex) => {
                            return (
                              <View key={dIndex} style={programStreamStyles.domainValueButtonWrapper}>
                                <Text style={programStreamStyles.domainValueButton}>{domain}</Text>
                              </View>
                            )
                          })}
                        </View>
                      </View>
                    </View>
                  </View>

                  <View style={programStreamStyles.rightSide}>
                    {this._renderViewReport(status, inActiveProgram)}
                    <TouchableWithoutFeedback onPress={() => this._checkProgramStream(program_stream, status)}>
                      <View style={[programStreamStyles.buttonWrapperTracking, { borderBottomWidth: 0, flex: 1 }]}>
                        <Text style={programStreamStyles.buttonTitle}>Enroll</Text>
                      </View>
                    </TouchableWithoutFeedback>
                  </View>
                </View>
              )
            })}
          </ScrollView>
        </View>
      )
    }
  }
}

const mapState = state => ({
  programStreams: state.programStreams.data
})

export default connect(mapState)(ActiveProgramStreams)
